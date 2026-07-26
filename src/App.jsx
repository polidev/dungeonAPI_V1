import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";

const Home = lazy(() => import("./pages/Home.jsx"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Suspense>
  );
}

export default App;
