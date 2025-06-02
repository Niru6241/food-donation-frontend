import { Link } from 'react-router-dom';
const Footer = () => {
  return <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <Link to="#" className="text-gray-500 hover:text-gray-700">
            About
          </Link>
          <Link to="#" className="text-gray-500 hover:text-gray-700">
            Contact
          </Link>
        </div>
        <div className="mt-4 md:mt-0 md:order-1">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} FoodShare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;