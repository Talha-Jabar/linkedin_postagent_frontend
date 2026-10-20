import { Route, Routes } from "react-router";

import { Layout } from "./components/Layout";
import { GeneratePage } from "./pages/GeneratePage";
import { HistoryPage } from "./pages/HistoryPage";
import { InsightsPage } from "./pages/InsightsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PostDetailPage } from "./pages/PostDetailPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<GeneratePage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="posts/:id" element={<PostDetailPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
