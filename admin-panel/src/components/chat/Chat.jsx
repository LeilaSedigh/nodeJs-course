import { Button, Form, Input, Spin, message as notification } from "antd";
import { SendOutlined, MessageOutlined } from "@ant-design/icons";
import useAuth from "../../hooks/useAuth";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import request from "../../tools/request";

function formatTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function Chat({ socket, channel }) {
    const [form] = Form.useForm();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [connected, setConnected] = useState(socket.connected);

    const [messageApi, contextHolder] = notification.useMessage();

    const wrapperRef = useRef(null);
    const messagesRef = useRef([]);
    const fetchingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const scrollActionRef = useRef(null);

    // بارگذاری تاریخچه و ثبت listener مخصوص همین گفت‌وگو
    useEffect(() => {
        let active = true;

        function onConnect() {
            setConnected(true);
        }

        function onDisconnect() {
            setConnected(false);
        }

        function onMessage(data) {
            const ownId = String(user.id);
            const contactId = String(channel.id);

            const belongsToConversation =
                (String(data.from) === ownId &&
                    String(data.to) === contactId) ||
                (String(data.from) === contactId &&
                    String(data.to) === ownId);

            if (!belongsToConversation) return;

            const wrapper = wrapperRef.current;
            const nearBottom =
                !wrapper ||
                wrapper.scrollHeight -
                    wrapper.scrollTop -
                    wrapper.clientHeight < 100;

            if (nearBottom || String(data.from) === ownId) {
                scrollActionRef.current = { type: "bottom" };
            }

            setMessages((current) => {
                if (
                    data.id != null &&
                    current.some(
                        (item) => String(item.id) === String(data.id)
                    )
                ) {
                    return current;
                }

                const next = [...current, data];
                messagesRef.current = next;
                return next;
            });
        }

        socket.on("message", onMessage);
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        async function loadInitialMessages() {
            try {
                const { data } = await request("/api/message", {
                    params: {
                        user,
                        channel: channel.id,
                    },
                });

                if (!active) return;

                const items = [...data].reverse();

                messagesRef.current = items;
                hasMoreRef.current = items.length > 0;
                scrollActionRef.current = { type: "bottom" };

                // پیام زنده‌ای که هنگام دریافت تاریخچه رسیده حفظ می‌شود.
                setMessages((current) => {
                    const historyIds = new Set(
                        items
                            .filter((item) => item.id != null)
                            .map((item) => String(item.id))
                    );

                    const next = [
                        ...items,
                        ...current.filter(
                            (item) =>
                                item.id == null ||
                                !historyIds.has(String(item.id))
                        ),
                    ];

                    messagesRef.current = next;
                    return next;
                });
            } catch {
                if (active) {
                    messageApi.error("دریافت پیام‌ها انجام نشد.");
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadInitialMessages();

        return () => {
            active = false;
            socket.off("message", onMessage);
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, [socket, channel.id, user, messageApi]);

    // با افزودن پیام جدید به پایین می‌رویم؛
    // با دریافت تاریخچه، موقعیت مطالعه حفظ می‌شود.
    useLayoutEffect(() => {
        const wrapper = wrapperRef.current;
        const action = scrollActionRef.current;

        if (!wrapper || !action) return;

        if (action.type === "bottom") {
            wrapper.scrollTop = wrapper.scrollHeight;
        } else {
            wrapper.scrollTop =
                action.top + wrapper.scrollHeight - action.height;
        }

        scrollActionRef.current = null;
    }, [messages]);

    async function loadOlderMessages() {
        const firstMessage = messagesRef.current[0];

        if (
            loading ||
            fetchingRef.current ||
            !hasMoreRef.current ||
            firstMessage?.id == null
        ) {
            return;
        }

        fetchingRef.current = true;
        setLoadingOlder(true);

        try {
            const { data } = await request("/api/message", {
                params: {
                    user,
                    channel: channel.id,
                    lastMessage: firstMessage.id,
                },
            });

            const existingIds = new Set(
                messagesRef.current.map((item) => String(item.id))
            );

            const older = [...data]
                .reverse()
                .filter((item) => !existingIds.has(String(item.id)));

            if (!older.length) {
                hasMoreRef.current = false;
                return;
            }

            const wrapper = wrapperRef.current;

            if (wrapper) {
                scrollActionRef.current = {
                    type: "preserve",
                    height: wrapper.scrollHeight,
                    top: wrapper.scrollTop,
                };
            }

            setMessages((current) => {
                const next = [...older, ...current];
                messagesRef.current = next;
                return next;
            });
        } catch {
            messageApi.error("دریافت پیام‌های قبلی انجام نشد.");
        } finally {
            fetchingRef.current = false;
            setLoadingOlder(false);
        }
    }

    function handleSubmit({ message }) {
        const text = message?.trim();

        if (!text) return;

        if (!socket.connected) {
            messageApi.warning("اتصال به سرور برقرار نیست.");
            return;
        }

        socket.emit("message", {
            message: text,
            from: user.id,
            to: channel.id,
        });

        form.resetFields();
    }

    return (
        <div className="conversation">
            {contextHolder}

            <div
                ref={wrapperRef}
                className="conversation__messages"
                onScroll={(event) => {
                    if (event.currentTarget.scrollTop <= 5) {
                        loadOlderMessages();
                    }
                }}
                aria-label="پیام‌های گفت‌وگو"
                aria-busy={loading}
            >
                {loadingOlder && (
                    <div className="conversation__older">
                        <Spin size="small" />
                    </div>
                )}

                {loading ? (
                    <div className="conversation__state">
                        <Spin />
                        <span>در حال دریافت پیام‌ها...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="conversation__state">
                        <MessageOutlined />
                        <span>اولین پیام این گفت‌وگو رو تو بنویس.</span>
                    </div>
                ) : null}

                <ul className="conversation__list">
                    {messages.map((item, index) => {
                        const owner =
                            String(item.from) === String(user.id);

                        return (
                            <li
                                key={item.id ?? `message-${index}`}
                                className={`conversation__message ${
                                    owner
                                        ? "conversation__message--owner"
                                        : ""
                                }`}
                            >
                                <div className="conversation__bubble">
                                    <p dir="auto">{item.message}</p>

                                    <time
                                        className="conversation__time"
                                        dateTime={item.createdAt || undefined}
                                    >
                                        {formatTime(item.createdAt)}
                                    </time>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <Form
                className="conversation__composer"
                form={form}
                onFinish={handleSubmit}
            >
                <div className="conversation__input-row">
                    <Form.Item
                        name="message"
                        className="conversation__field"
                    >
                        <Input
                            placeholder="پیامت رو بنویس..."
                            aria-label="متن پیام"
                            autoComplete="off"
                            disabled={!connected}
                        />
                    </Form.Item>

                    <Button
                        className="conversation__send"
                        htmlType="submit"
                        icon={<SendOutlined />}
                        disabled={!connected}
                        aria-label="ارسال پیام"
                    />
                </div>

                <span className="conversation__hint">
                    {connected
                        ? "برای ارسال پیام، Enter بزن."
                        : "در انتظار اتصال مجدد به سرور..."}
                </span>
            </Form>
        </div>
    );
}
