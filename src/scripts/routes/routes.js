import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import addStoryPage from '../pages/addStory/addStory';
import NotFoundPage from '../pages/notFound/not-found';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/add-story': new addStoryPage(),
  '*': new NotFoundPage(),
};

export default routes;
