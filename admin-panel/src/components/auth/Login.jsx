import { Button, Form, Input, message } from 'antd';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import './Login.css';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();

    async function onFinish(values) {
        setLoading(true);

        try {
            await login(values);
        } catch {
            messageApi.error(
                'ورود انجام نشد؛ اطلاعات حساب یا اتصال به سرور را بررسی کنید.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="diagonal-login">
            {contextHolder}

            <section className="diagonal-login__card">
                <aside className="diagonal-login__visual">
                    <div className="diagonal-login__facets" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>

                    <div className="diagonal-login__welcome">
                        <span className="diagonal-login__eyebrow">
                            YOUR CONTENT. YOUR SPACE.
                        </span>

                        <h2>
                            Welcome
                            <br />
                            Back.
                        </h2>
                    </div>
                </aside>

                <div className="diagonal-login__form-side">
                    <header className="diagonal-login__header">
                        <span className="diagonal-login__brand">
                            BLOG / ADMIN
                        </span>

                        <h1>Login</h1>
                    </header>

                    <Form
                        className="diagonal-login__form"
                        name="login"
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                    >
                        <Form.Item
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    whitespace: true,
                                    message: 'نام کاربری را وارد کنید.',
                                },
                            ]}
                        >
                            <Input
                                aria-label="Username"
                                placeholder="Username"
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck={false}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'رمز عبور را وارد کنید.',
                                },
                            ]}
                        >
                            <Input.Password
                                aria-label="Password"
                                placeholder="Password"
                                autoComplete="current-password"
                            />
                        </Form.Item>

                        <div className="diagonal-login__actions">
                            <span>ADMIN ACCESS</span>

                            <Button
                                className="diagonal-login__button"
                                htmlType="submit"
                                loading={loading}
                            >
                                {loading ? 'SIGNING IN' : 'LOGIN'}
                            </Button>
                        </div>
                    </Form>

                    <footer className="diagonal-login__footer">
                        A little space for your big ideas.
                    </footer>
                </div>
            </section>
        </main>
    );
};

export default Login;
