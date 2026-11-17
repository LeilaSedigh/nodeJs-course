import { Button, Empty, message, Popconfirm, Table, Tooltip } from "antd";
import request from "../../tools/request";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import {
    DeleteOutlined,
    EyeOutlined,
    FileTextOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import "./List.css";

async function getArticles(page) {
    const { data } = await request("/api/article", {
        params: { page },
    });

    return data;
}

export default function List() {
    const [page, setPage] = useState(1);
    const [messageApi, contextHolder] = message.useMessage();

    const {
        data,
        isFetching,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["articles", page],
        queryFn: () => getArticles(page),
    });

    const {
        mutateAsync: removeArticle,
        isPending: isRemoving,
        variables: removingId,
    } = useMutation({
        mutationKey: ["remove-article"],
        mutationFn: (id) => request.delete(`/api/article/${id}`),
    });

    // با نام فیلد فعلی بک‌اند و حالت total سازگار است.
    const total = Number(data?.totals ?? data?.total ?? 0);
    const pageSize = Number(data?.limit ?? 4);

    async function handleRemove(id) {
        try {
            await removeArticle(id);
            messageApi.success("مقاله حذف شد.");

            if (data?.items?.length === 1 && page > 1) {
                setPage((current) => current - 1);
            } else {
                await refetch();
            }
        } catch {
            messageApi.error("حذف مقاله انجام نشد. دوباره تلاش کنید.");
        }
    }

    const columns = [
        {
            title: "شناسه",
            dataIndex: "id",
            key: "id",
            width: 90,
            render: (id) => (
                <span className="articles-id">#{id}</span>
            ),
        },
        {
            title: "عنوان مقاله",
            dataIndex: "title",
            key: "title",
            render: (title, record) => (
                <Link
                    className="articles-title"
                    to={`/article/${record.id}`}
                >
                    <span className="articles-file-icon">
                        <FileTextOutlined />
                    </span>

                    <span>{title || "بدون عنوان"}</span>
                </Link>
            ),
        },
        {
            title: "نویسنده",
            dataIndex: "user",
            key: "user",
            width: 190,
            render: (user) => {
                const username = user?.username || "نامشخص";

                return (
                    <div className="articles-author">
                        <span className="articles-author__avatar">
                            {Array.from(username)[0]?.toUpperCase()}
                        </span>
                        <span>{username}</span>
                    </div>
                );
            },
        },
        {
            title: "عملیات",
            key: "actions",
            width: 120,
            align: "center",
            render: (_, record) => (
                <div className="articles-actions">
                    <Tooltip title="مشاهده مقاله">
                        <Link
                            className="articles-action articles-action--view"
                            to={`/article/${record.id}`}
                            aria-label={`مشاهده ${record.title || "مقاله"}`}
                        >
                            <EyeOutlined />
                        </Link>
                    </Tooltip>

                    <Popconfirm
                        title="حذف مقاله"
                        description="این مقاله حذف شود؟ این کار قابل بازگشت نیست."
                        onConfirm={() => handleRemove(record.id)}
                        okText="حذف مقاله"
                        cancelText="انصراف"
                        okButtonProps={{
                            danger: true,
                            loading: isRemoving && removingId === record.id,
                        }}
                        disabled={isRemoving}
                    >
                        <Button
                            className="articles-action articles-action--delete"
                            type="text"
                            icon={<DeleteOutlined />}
                            aria-label={`حذف ${record.title || "مقاله"}`}
                            loading={isRemoving && removingId === record.id}
                            disabled={isRemoving}
                        />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <section className="articles-page" dir="rtl">
            {contextHolder}

            <header className="articles-header">
                <div>
                    <div className="articles-heading">
                        <h2>مقالات</h2>
                        <span className="articles-count">{total}</span>
                    </div>

                    <p>محتوایت را مدیریت کن و ایده‌های تازه منتشر کن.</p>
                </div>

                <Link className="articles-create" to="/article/add">
                    <PlusOutlined />
                    <span>مقاله جدید</span>
                </Link>
            </header>

            {isError && (
                <div className="articles-error" role="alert">
                    <span>دریافت مقالات انجام نشد.</span>
                    <Button type="link" onClick={() => refetch()}>
                        تلاش دوباره
                    </Button>
                </div>
            )}

            <Table
                className="articles-table"
                dataSource={data?.items ?? []}
                loading={isFetching}
                columns={columns}
                rowKey="id"
                scroll={{ x: 620 }}
                onChange={({ current }) => setPage(current ?? 1)}
                pagination={{
                    total,
                    current: page,
                    pageSize,
                    showSizeChanger: false,
                    hideOnSinglePage: true,
                    showTotal: (count) => `${count} مقاله`,
                }}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="هنوز مقاله‌ای برای نمایش وجود ندارد."
                        />
                    ),
                }}
            />
        </section>
    );
}
