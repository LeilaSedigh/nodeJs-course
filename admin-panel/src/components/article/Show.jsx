import { Link, useParams } from "react-router";
import { Button, Empty, Spin } from "antd";
import {
    ArrowRightOutlined,
    FileTextOutlined,
    UserOutlined,
} from "@ant-design/icons";
import request from "../../tools/request";
import { useQuery } from "@tanstack/react-query";
import "./Show.css";

async function getArticle(id) {
    const { data } = await request(`/api/article/${id}`);
    return data;
}

function getImageUrl(image) {
    if (typeof image !== "string" || !image.trim()) {
        return null;
    }

    // اگر بک‌اند آدرس کامل برگرداند، بدون تغییر استفاده می‌کنیم.
    if (/^https?:\/\//i.test(image)) {
        return image;
    }

    const baseUrl = (import.meta.env.VITE_BASE_URL || "")
        .replace(/\/+$/, "");

    return `${baseUrl}/${image.replace(/^\/+/, "")}`;
}

export default function Show() {
    const { id } = useParams();

    const {
        data,
        isPending,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ["article", id],
        queryFn: () => getArticle(id),
        enabled: Boolean(id),
    });

    if (isPending) {
        return (
            <div className="article-view-state" role="status">
                <Spin size="large" />
                <span>در حال دریافت مقاله...</span>
            </div>
        );
    }

    if (isError) {
        const notFound = error?.response?.status === 404;

        return (
            <div className="article-view-state" dir="rtl">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        notFound
                            ? "مقاله پیدا نشد."
                            : "دریافت مقاله انجام نشد."
                    }
                />

                <div className="article-view-state__actions">
                    <Link to="/article">بازگشت به مقالات</Link>

                    {!notFound && (
                        <Button
                            onClick={() => refetch()}
                            loading={isFetching}
                        >
                            تلاش دوباره
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    const imageUrl = getImageUrl(data?.image);
    const username = data?.user?.username || "نامشخص";

    return (
        <article className="article-view" dir="rtl">
            <nav className="article-view__nav" aria-label="مسیر مقاله">
                <Link className="article-view__back" to="/article">
                    <ArrowRightOutlined />
                    <span>بازگشت به مقالات</span>
                </Link>

                <span className="article-view__badge">
                    <FileTextOutlined />
                    مقاله
                </span>
            </nav>

            <header className="article-view__header">
                <span className="article-view__eyebrow">
                    BLOG / ARTICLE
                </span>

                <h2>{data?.title || "بدون عنوان"}</h2>

                <div className="article-view__meta">
                    <div className="article-view__author">
                        <span className="article-view__avatar">
                            <UserOutlined />
                        </span>

                        <div>
                            <span className="article-view__author-label">
                                نویسنده
                            </span>
                            <strong>{username}</strong>
                        </div>
                    </div>

                    <span className="article-view__id">
                        شناسه مقاله
                        <span dir="ltr">#{data?.id ?? id}</span>
                    </span>
                </div>
            </header>

            {imageUrl && (
                <figure className="article-view__cover">
                    <img
                        key={imageUrl}
                        src={imageUrl}
                        alt={data?.title || "تصویر مقاله"}
                        onError={(event) => {
                            // تصویر خراب را به شکل آیکون شکسته نمایش نمی‌دهیم.
                            event.currentTarget.hidden = true;
                        }}
                    />
                </figure>
            )}

            <section
                className="article-view__body"
                aria-label="متن مقاله"
            >
                {data?.text ? (
                    <div className="article-view__text">
                        {data.text}
                    </div>
                ) : (
                    <p className="article-view__empty">
                        متنی برای این مقاله ثبت نشده است.
                    </p>
                )}
            </section>

            <footer className="article-view__footer">
                <span>پایان مقاله</span>
                <span aria-hidden="true">✦</span>
                <span dir="ltr">BLOG STUDIO</span>
            </footer>
        </article>
    );
}
