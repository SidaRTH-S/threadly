import {
BrowserRouter,
Routes,
Route,
useLocation,
} from "react-router-dom";
import Search from "./pages/Search";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";
import CreatePost from "./pages/CreatePost";
import Navbar from "./components/Navbar";
import Communities from "./pages/Communities";
import CreateCommunity from "./pages/CreateCommunity";
import Community from "./pages/Community";
import Post from "./pages/Post";
import SavedPosts from "./pages/SavedPosts";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
const Layout = () => {
const location = useLocation();

const hideNavbar =
location.pathname === "/login" ||
location.pathname === "/register" ||
location.pathname === "/verify-email";

return (
<>
{!hideNavbar && <Navbar />}

  <Routes>
    <Route
      path="/notifications"
      element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      }
    />
    <Route
      path="/create-community"
      element={<CreateCommunity />}
    />
    <Route
      path="/saved"
      element={
        <ProtectedRoute>
          <SavedPosts />
        </ProtectedRoute>
      }
    />

    <Route
      path="/posts/:id"
      element={
        <ProtectedRoute>
          <Post />
        </ProtectedRoute>
      }
    />

    <Route
      path="/communities/:name"
      element={
        <ProtectedRoute>
          <Community />
        </ProtectedRoute>
      }
    />

    <Route
      path="/communities"
      element={
        <ProtectedRoute>
          <Communities />
        </ProtectedRoute>
      }
    />

    <Route
      path="/create-post"
      element={
        <ProtectedRoute>
          <CreatePost />
        </ProtectedRoute>
      }
    />

    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      }
    />

    <Route
      path="/login"
      element={<Login />}
    />

    <Route
      path="/register"
      element={<Register />}
    />

    <Route
      path="/verify-email"
      element={<VerifyEmail />}
    />
    <Route path="/search" element={<Search />} />
    <Route
      path="/profile/:username"
      element={<Profile />}
    />
    <Route
      path="/edit-profile"
      element={<EditProfile />}
    />
  </Routes>
</>

);
};

function App() {
return ( <BrowserRouter> <Layout /> </BrowserRouter>
);
}

export default App;
