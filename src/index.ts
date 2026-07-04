import { Hono } from 'hono'
import { homePage } from './pages/home.js'
import { loginPage } from './pages/login.js'
import { signupPage } from './pages/signup.js'
import { llmsTxt } from './content/llms.js'

const app = new Hono()

app.get('/', (c) => c.html(homePage))
app.get('/login', (c) => c.html(loginPage))
app.get('/signup', (c) => c.html(signupPage))
app.get('/llms.txt', (c) => c.text(llmsTxt))

export default app
