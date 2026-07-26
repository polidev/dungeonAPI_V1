import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import { ToastProvider } from "./context/ToastContext.jsx";
import Layout from "./components/layout/Layout.jsx";
import Loader from "./components/ui/Loader.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const DungeonList = lazy(() => import("./pages/dungeons/DungeonList.jsx"));
const DungeonDetail = lazy(() => import("./pages/dungeons/DungeonDetail.jsx"));
const MonsterList = lazy(() => import("./pages/monsters/MonsterList.jsx"));
const MonsterDetail = lazy(() => import("./pages/monsters/MonsterDetail.jsx"));
const ItemList = lazy(() => import("./pages/items/ItemList.jsx"));
const ItemDetail = lazy(() => import("./pages/items/ItemDetail.jsx"));
const CharacterList = lazy(() => import("./pages/characters/CharacterList.jsx"));
const CharacterDetail = lazy(() => import("./pages/characters/CharacterDetail.jsx"));

function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader /></div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/dungeons" element={<DungeonList />} />
            <Route path="/dungeons/:id" element={<DungeonDetail />} />
            <Route path="/monsters" element={<MonsterList />} />
            <Route path="/monsters/:id" element={<MonsterDetail />} />
            <Route path="/items" element={<ItemList />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/characters" element={<CharacterList />} />
            <Route path="/characters/:id" element={<CharacterDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}

export default App;
