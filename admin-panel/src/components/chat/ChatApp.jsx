import io from "socket.io-client";
import { getAccessToken } from "../../tools/utils";
import { useQuery } from "@tanstack/react-query";
import { Button, Spin } from "antd";
import {
  ArrowRightOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import request from "../../tools/request";
import Chat from "./Chat";
import "./chat.css";

const token = getAccessToken()?.trim();

const socket = io(import.meta.env.VITE_BASE_URL, {
  extraHeaders: token
    ? {
        authorization: token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`,
      }
    : {},
});


export default function ChatApp() {
  const [channel, setChannel] = useState();

  const { data: users, isPending, isError } = useQuery({
    queryKey: ["people"],
    queryFn: () => request("/api/person").then(({ data }) => data),
  });

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
              <p>یک مخاطب برای شروع گفت‌وگو انتخاب کن.</p>
            </div>
          </div>
        </header>

        <div className="messenger__users">
          {isPending ? (
            <div className="messenger__list-state" role="status">
              <Spin />
              <span>در حال دریافت مخاطب‌ها...</span>
            </div>
          ) : !users?.length ? (
            <div className="messenger__list-state">
              <UserOutlined />
              <span>
                {isError
                  ? "دریافت مخاطب‌ها انجام نشد."
                  : "مخاطبی پیدا نشد."}
              </span>
            </div>
          ) : (
            users.map((user) => (
              <button
                type="button"
                key={user.id}
                className={`messenger__user ${
                  user.id === channel?.id ? "messenger__user--active" : ""
                }`}
                onClick={() => setChannel(user)}
                aria-pressed={user.id === channel?.id}
              >
                <span className="messenger__avatar" aria-hidden="true">
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
      </aside>

      <div className="messenger__main">
        {channel ? (
          <>
            <header className="messenger__conversation-header">
              <Button
                className="messenger__back"
                type="text"
                icon={<ArrowRightOutlined />}
                onClick={() => setChannel(undefined)}
                aria-label="بازگشت به مخاطب‌ها"
              />

              <span className="messenger__avatar" aria-hidden="true">
                {Array.from(channel.username || "?")[0].toUpperCase()}
              </span>

              <div className="messenger__conversation-info">
                <strong>{channel.username || "بدون نام"}</strong>
                <span>گفت‌وگوی مستقیم</span>
              </div>
            </header>

            <div className="messenger__chat-body">
              <Chat key={channel.id} channel={channel} socket={socket} />
            </div>
          </>
        ) : (
          <div className="messenger__empty">
            <span className="messenger__empty-icon">
              <MessageOutlined />
            </span>
            <span className="messenger__eyebrow">LET’S TALK</span>
            <h3>هر گفت‌وگو، یک شروع تازه‌ست.</h3>
            <p>یک مخاطب از لیست انتخاب کن و اولین پیام رو بفرست.</p>
          </div>
        )}
      </div>
    </section>
  );
}
