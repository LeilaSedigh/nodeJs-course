import { Button, Layout, Menu, Spin } from 'antd';
import {
  FileTextOutlined,
  MessageOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import Login from './components/auth/Login';
import useAuth from './hooks/useAuth';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router';
import ArticleRouter from './components/article/Router';
import ChatApp from './components/chat/ChatApp';
import './App.css';

const { Header, Sider, Content, Footer } = Layout;

function App() {
  const { isLoggedIn, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const activePage = location.pathname.startsWith('/chat')
    ? '/chat'
    : '/article';

  const pageTitle = activePage === '/chat' ? 'گفت‌وگوها' : 'مدیریت مقالات';

  if (loading) {
    return (
      <div className="app-loading">
        <Spin size="large" />
        <span>در حال آماده‌سازی پنل...</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <Layout className="admin-shell" dir="rtl">
      <Sider width={240} className="admin-sidebar" theme="light">
        <div className="admin-sidebar__inner">
          <div className="admin-brand">
            <span className="admin-brand__icon">
              <AppstoreOutlined />
            </span>

            <div className="admin-brand__text">
              <strong>بلاگ استودیو</strong>
              <span>CONTENT MANAGEMENT</span>
            </div>
          </div>

          <span className="admin-sidebar__label">فضای کاری</span>

          <Menu
            className="admin-menu"
            mode="inline"
            selectedKeys={[activePage]}
            onClick={({ key }) => navigate(key)}
            items={[
              {
                key: '/article',
                icon: <FileTextOutlined />,
                label: 'مقالات',
              },
              {
                key: '/chat',
                icon: <MessageOutlined />,
                label: 'گفت‌وگوها',
              },
            ]}
          />

          <div className="admin-sidebar__bottom">
            <div className="admin-sidebar__note">
              <span className="admin-sidebar__note-icon">✦</span>
              <strong>جای ایده‌های خوب.</strong>
              <p>بنویس، منتشر کن و الهام‌بخش باش.</p>
            </div>

            <Button
              className="admin-logout"
              icon={<LogoutOutlined />}
              onClick={logout}
              block
            >
              خروج از حساب
            </Button>
          </div>
        </div>
      </Sider>

      <Layout className="admin-main">
        <Header className="admin-header">
          <div>
            <span className="admin-header__eyebrow">پنل مدیریت</span>
            <h1>{pageTitle}</h1>
          </div>

          <div className="admin-account">
            <span className="admin-account__avatar">A</span>

            <div className="admin-account__text">
              <strong>حساب کاربری</strong>
              <span>پنل مدیریت بلاگ</span>
            </div>
          </div>
        </Header>

        <Content className="admin-content">
          <div className="admin-content__surface">
            <Routes>
              <Route path="/" element={<Navigate to="/article" replace />} />
              <Route path="/article/*" element={<ArticleRouter />} />
              <Route path="/chat" element={<ChatApp />} />
              <Route path="*" element={<Navigate to="/article" replace />} />
            </Routes>
          </div>
        </Content>

        <Footer className="admin-footer">
          <span>با ایده‌های تازه ادامه بده.</span>
          <span dir="ltr">BLOG STUDIO © {new Date().getFullYear()}</span>
        </Footer>
      </Layout>
    </Layout>
  );
}

export default App;
