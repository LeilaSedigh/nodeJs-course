import { io } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import { Button, Input, Spin } from "antd";
import {
  ArrowRightOutlined,
  MessageOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import request from "../../tools/request";
import Chat from "./Chat";
import "./chat.css";

export default function ChatApp() {
  const [channel, setChannel] = useState(null);
  const [search, setSearch] = useState("");
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const connection = io(import.meta.env.VITE_BASE_URL, {
      // فعلاً مطابق تنظیم فعلی سرور حفظ شده است.
      extraHeaders: {
        authorization: "GAPGPTMASKTOKENcpkirvhprwaX0X",
      },
    });

    function onConnect() {
      setConnected(true);
    }

    function onDisconnect() {
      setConnected(false);
    }

    connection.on("connect", onConnect);
    connection.on("disconnect", onDisconnect);
    setSocket(connection);

    return () => {
      connection.off("connect", onConnect);
      connection.off("disconnect", onDisconnect);
      connection.disconnect();
    };
  }, []);

  const {
    data: users = [],
    isPending,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["person"],
    queryFn: () =>
      request("/api/person").then(({ data }) => data),
  });

  const filteredUsers = users.filter((user) =>
    String(user.username ?? "")
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase())
  );

  return (
    <section
      className={`messenger ${channel ? "messenger--selected" : ""}`}
      dir="rtl"
      aria-label="گفت‌وگوها"
    >
      <aside className="messenger__sidebar">
        <header className="messenger__sidebar-header">
          <div className="messenger__heading">
            <span className="messenger__heading-icon">
              <MessageOutlined />
            </span>

            <div>
              <h2>گفت‌وگوها</h2>
              <p>یک گفت‌وگوی تازه شروع کن.</p>
            </div>
          </div>

          <Input
            className="messenger__search"
            prefix={<SearchOutlined />}
            placeholder="جست‌وجوی مخاطب..."
            aria-label="جست‌وجوی مخاطب"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            allowClear
          />
        </header>

        <div className="messenger__users">
          {isPending ? (
            <div className="messenger__list-state" role="status">
              <Spin />
              <span>دریافت مخاطب‌ها...</span>
            </div>
          ) : isError ? (
            <div className="messenger__list-state" role="alert">
              <span>دریافت مخاطب‌ها انجام نشد.</span>
              <Button
                size="small"
                onClick={() => refetch()}
                loading={isFetching}
              >
                تلاش دوباره
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="messenger__list-state">
              <UserOutlined />
              <span>مخاطبی پیدا نشد.</span>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                type="button"
                className={`messenger__user ${
                  user.id === channel?.id
                    ? "messenger__user--active"
                    : ""
                }`}
                key={user.id}
                onClick={() => setChannel(user)}
                aria-pressed={user.id === channel?.id}
              >
                <span className="messenger__avatar">
                  {Array.from(user.username || "?")[0].toUpperCase()}
                </span>

                <span className="messenger__user-info">
                  <strong>{user.username || "بدون نام"}</strong>
                  <span>مشاهده گفت‌وگو</span>
                </span>

                <MessageOutlined className="messenger__user-icon" />
              </button>
            ))
          )}
        </div>

        <footer className="messenger__connection">
          <span
            className={`messenger__connection-dot ${
              connected ? "messenger__connection-dot--online" : ""
            }`}
          />
          {connected ? "متصل به سرور گفت‌وگو" : "اتصال به سرور برقرار نیست"}
        </footer>
      </aside>

      <div className="messenger__main">
        {channel ? (
          <>
            <header className="messenger__conversation-header">
              <Button
                className="messenger__back"
                type="text"
                icon={<ArrowRightOutlined />}
                onClick={() => setChannel(null)}
                aria-label="بازگشت به مخاطب‌ها"
              />

              <span className="messenger__avatar">
                {Array.from(channel.username || "?")[0].toUpperCase()}
              </span>

              <div className="messenger__conversation-info">
                <strong>{channel.username || "بدون نام"}</strong>
                <span>گفت‌وگوی مستقیم</span>
              </div>
            </header>

            <div className="messenger__chat-body">
              {socket ? (
                <Chat
                  key={channel.id}
                  channel={channel}
                  socket={socket}
                />
              ) : (
                <div className="messenger__list-state">
                  <Spin />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="messenger__empty">
            <span className="messenger__empty-icon">
              <MessageOutlined />
            </span>

            <span className="messenger__eyebrow">LET’S TALK</span>
            <h3>هر گفت‌وگو، یک شروع تازه‌ست.</h3>
            <p>
              یک مخاطب از لیست انتخاب کن
              <br />
              و اولین پیام رو بفرست.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
