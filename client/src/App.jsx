import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import Product from "./pages/Product.jsx";
import Checkout from "./pages/Checkout.jsx";
import Success from "./pages/Success.jsx";
import Gallery from "./pages/Gallery.jsx";
import Profile from "./pages/Profile.jsx";
import Members from "./pages/Members.jsx";
import Story from "./pages/Story.jsx";
import { WordSlide } from "./components/WordSlide.jsx";

function NotFound() {
  return (
    <section className="page-top center">
      <WordSlide text="Lost in the journey" immediate />
      <p className="body-copy">That page doesn't exist.</p>
      <a href="/" className="btn btn-dark"><span>Back to home</span></a>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="members" element={<Members />} />
        <Route path="story" element={<Story />} />
        <Route path="account" element={<Profile />} />
        <Route path="product/:id" element={<Product />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="success" element={<Success />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
