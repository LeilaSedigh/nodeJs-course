import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message } from "antd";
import {
  ArrowRightOutlined,
  FileTextOutlined,
  PictureOutlined,
  SendOutlined,
} from "@ant-design/icons";
import request from "../../tools/request";
import { useNavigate } from "react-router";
import Uploader from "../../utils/uploader";
import "./Add.css";

function createArticle(data) {
  return request.post("/api/article", data);
}

export default function Add() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createArticle,
  });

  async function onSubmit(data) {
    try {
      await mutateAsync(data);

      await queryClient.invalidateQueries({
        queryKey: ["articles"],
      });

      messageApi.success("مقاله با موفقیت منتشر شد.");
      navigate("/article");
    } catch {
      messageApi.error(
        "ثبت مقاله انجام نشد؛ اطلاعات یا اتصال به سرور را بررسی کنید."
      );
    }
  }

  return (
    <section className="article-editor" dir="rtl">
      {contextHolder}

      <header className="article-editor__header">
        <div>
          <span className="article-editor__eyebrow">یک ایده‌ی تازه</span>
          <h2>ساخت مقاله</h2>
          <p>عنوان، متن و تصویر مقاله‌ات را اینجا اضافه کن.</p>
        </div>

        <Button
          className="article-editor__back"
          icon={<ArrowRightOutlined />}
          onClick={() => navigate("/article")}
          disabled={isPending}
        >
          بازگشت به مقالات
        </Button>
      </header>

      <div className="article-editor__layout">
        <Form
          className="article-editor__form"
          name="create-article"
          layout="vertical"
          requiredMark={false}
          onFinish={onSubmit}
          disabled={isPending}
          scrollToFirstError
        >
          <div className="article-editor__section-title">
            <span className="article-editor__section-icon">
              <FileTextOutlined />
            </span>

            <div>
              <h3>محتوای مقاله</h3>
              <p>از یک عنوان خوب شروع کن.</p>
            </div>
          </div>

          <Form.Item
            label="عنوان مقاله"
            name="title"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "عنوان مقاله را وارد کنید.",
              },
            ]}
          >
            <Input placeholder="یک عنوان روشن و جذاب بنویس..." />
          </Form.Item>

          <Form.Item
            label="متن مقاله"
            name="text"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "متن مقاله را وارد کنید.",
              },
            ]}
          >
            <Input.TextArea
              placeholder="داستان از اینجا شروع می‌شود..."
              autoSize={{ minRows: 10, maxRows: 22 }}
            />
          </Form.Item>

          <div className="article-editor__upload">
            <div className="article-editor__upload-heading">
              <PictureOutlined />
              <span>تصویر مقاله</span>
            </div>

            <Uploader />
          </div>

          <footer className="article-editor__actions">
            <span>قبل از انتشار، محتوا را یک بار مرور کن.</span>

            <div className="article-editor__buttons">
              <Button
                className="article-editor__cancel"
                onClick={() => navigate("/article")}
                disabled={isPending}
              >
                انصراف
              </Button>

              <Button
                className="article-editor__publish"
                htmlType="submit"
                loading={isPending}
                icon={<SendOutlined />}
              >
                {isPending ? "در حال انتشار..." : "انتشار مقاله"}
              </Button>
            </div>
          </footer>
        </Form>

        <aside className="article-editor__guide">
          <span className="article-editor__guide-symbol" aria-hidden="true">
            ✦
          </span>

          <h3>محتوای خوب، دیده می‌شود.</h3>
          <p>
            لازم نیست پیچیده بنویسی؛ کافی‌ست حرفی روشن و خواندنی داشته باشی.
          </p>

          <div className="article-editor__tips">
            <div>
              <span>01</span>
              <p>عنوانی انتخاب کن که موضوع را واضح نشان بدهد.</p>
            </div>

            <div>
              <span>02</span>
              <p>پاراگراف‌ها را کوتاه و خوانا نگه دار.</p>
            </div>

            <div>
              <span>03</span>
              <p>یک تصویر مرتبط، به مقاله‌ات شخصیت می‌دهد.</p>
            </div>
          </div>

          <span className="article-editor__guide-footer" dir="ltr">
            MAKE ROOM FOR GOOD IDEAS.
          </span>
        </aside>
      </div>
    </section>
  );
}
