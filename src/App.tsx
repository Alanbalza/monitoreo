import './assets/css/App.css'
import { ThemeProvider } from "./components/theme-provider"
import Page from './Dashboard/página'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Page/>
    </ThemeProvider>
  )
}
 
export default App