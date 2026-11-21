import { Button, Form, Input } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import request from "../../tools/request";

export default function Chat({ socket, channel }) {
    const [form] = useForm();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const listRef = useRef();
    const wrapperListRef = useRef();

    useLayoutEffect(() => {
        listRef.current.scrollIntoView();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages[messages.length - 1]]);

    useEffect(() => {
        loadMessages();
        socket.on("message", (data) => setMessages((s) => [...s, data]));
    }, [socket]);

    function handleSubmit({ message }) {
        socket.emit("message", { message, from: user.id, to: channel.id });
        form.resetFields();
    }

    function loadMessages() {
        const prevScrollHeight = wrapperListRef.current.scrollHeight;

        request("/api/message", {
            params: { user, channel: channel.id, lastMessage: messages[0]?.id },
        }).then(({ data }) => {
            setMessages((s) => [...data.reverse(), ...s]);

            setTimeout(() => {
                const offset = wrapperListRef.current.scrollHeight - prevScrollHeight;
                wrapperListRef.current.scrollTop = offset;
            }, 50);
        });
    }

    function handleScroll(e) {
        if (e.target.scrollTop === 0) {
            loadMessages();
        }
    }

    return (
        <div className="conversation">
            <div
                className="conversation__messages"
                ref={wrapperListRef}
                onScroll={handleScroll}
                aria-label="پیام‌های گفت‌وگو"
            >
                <ul className="conversation__list">
                    {messages.map((message) => (
                        <li
                            key={message.id}
                            className={`conversation__message ${message.from == user?.id ? "conversation__message--owner" : ""
                                }`}
                        >
                            <div className="conversation__bubble">
                                <p dir="auto">{message.message}</p>
                                <time className="conversation__time">
                                    {message.createdAt}
                                </time>
                            </div>
                        </li>
                    ))}
                    <li ref={listRef} aria-hidden="true" />
                </ul>
            </div>

            <Form
                className="conversation__composer"
                onFinish={handleSubmit}
                form={form}
            >
                <div className="conversation__input-row">
                    <Form.Item name="message" className="conversation__field">
                        <Input
                            autoFocus
                            placeholder="پیامت رو بنویس..."
                            aria-label="متن پیام"
                        />
                    </Form.Item>

                    <Button
                        className="conversation__send"
                        htmlType="submit"
                        type="primary"
                        icon={<SendOutlined style={{ transform: "scaleX(-1)" }} />}
                        aria-label="ارسال پیام"
                    />
                </div>

                <span className="conversation__hint">
                    برای ارسال پیام، Enter بزن.
                </span>
            </Form>
        </div>
    );
}
