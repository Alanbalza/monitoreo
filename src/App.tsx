import "./assets/css/App.css";
import { ThemeProvider } from "./components/theme-provider";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Page from "./Dashboard/página";
import { Reporte } from "./Dashboard/report";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Page />} />
          <Route path="/reporte" element={<Reporte />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
