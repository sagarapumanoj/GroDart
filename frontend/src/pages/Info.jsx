import { Link } from 'react-router-dom';
import StaticPage from '../components/StaticPage';

export function About() {
  return (
    <StaticPage title="About GroDart" intro="One app for the things a home needs every week, delivered from local vendors in Visakhapatnam.">
      <p>Most delivery apps make you search for every item. GroDart starts from what you want to cook: pick a recipe and we add every ingredient in the right quantity, so nothing is forgotten and nothing is guessed.</p>
      <h2>What you can order today</h2>
      <ul>
        <li>Fresh vegetables and fruits</li>
        <li>Dairy, staples and spices</li>
        <li>Chicken</li>
        <li>Drinking water cans</li>
        <li>Snacks</li>
        <li><Link to="/recipes">Recipe kits</Link> with every ingredient for the dish</li>
      </ul>
      <h2>What we are building next</h2>
      <ul>
        <li>Online payments</li>
        <li>Medicines and monthly water supply</li>
        <li>Home services: cleaning, laundry and lunch box delivery</li>
        <li>Live order tracking and a mobile app</li>
      </ul>
      <p>We are starting small in one city so we can get every delivery right before we grow.</p>
    </StaticPage>
  );
}

export function Help() {
  return (
    <StaticPage title="Help and support" intro="Questions about an order, a refund or your account? Reach us here.">
      <ul>
        <li>Email: <a href="mailto:dartgro@gmail.com">dartgro@gmail.com</a></li>
        <li>Phone: <a href="tel:+919346625659">+91 93466 25659</a></li>
        <li>Phone: <a href="tel:+919849933384">+91 98499 33384</a></li>
      </ul>
      <h2>Common questions</h2>
      <p><strong>Can I cancel an order?</strong> Yes, from <Link to="/orders">My orders</Link>, until it is being packed.</p>
      <p><strong>How much is delivery?</strong> ₹25, and free on orders of ₹299 or more.</p>
      <p><strong>How do I pay?</strong> Cash on delivery for now. Online payment is coming soon.</p>
      <p><strong>How do I use an offer code?</strong> Enter it at checkout. See all current codes on the <Link to="/offers">offers page</Link>.</p>
    </StaticPage>
  );
}

export function Privacy() {
  return (
    <StaticPage title="Privacy policy" intro="What we collect, why, and who sees it.">
      <p>We collect your mobile number to log you in, and your name, optional email and delivery addresses so we can deliver your orders. We also keep your order history.</p>
      <p>We use this information only to run GroDart: sign you in, deliver orders and contact you about them. We do not sell your personal information.</p>
      <p>Your login uses a one-time code sent to your phone. We store a scrambled version of it, and it expires after a few minutes.</p>
      <p>You can change your name, email and saved addresses on your <Link to="/profile">profile</Link>. To delete your account and data, email <a href="mailto:dartgro@gmail.com">dartgro@gmail.com</a>.</p>
    </StaticPage>
  );
}

export function Terms() {
  return (
    <StaticPage title="Terms of service" intro="The basics of using GroDart.">
      <p>By using GroDart you agree to these terms. You must be 18 or older, or use GroDart with a parent or guardian.</p>
      <p>You are responsible for keeping your account secure. Misuse or fraudulent orders can lead to your account being suspended.</p>
      <p>Prices, offers and stock can change without notice. The price you see in your cart when you place the order is the price you pay. Each offer code has its own conditions, shown on the <Link to="/offers">offers page</Link>.</p>
      <p>Orders can be cancelled until they are being packed. Questions about a refund? Contact us on the <Link to="/help">help page</Link>.</p>
    </StaticPage>
  );
}
