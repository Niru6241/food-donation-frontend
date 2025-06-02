import { Link } from 'react-router-dom';
import { ArrowRightIcon, UtensilsIcon, HeartHandshakeIcon, BuildingIcon } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {useAuth} from "../context/AuthContext.tsx";

const Home = () => {


  const {isAuthenticated, user} = useAuth();

  return <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-emerald-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Share Food, <span className="text-emerald-200">Share Hope</span>
              </h1>
              <p className="mt-6 text-xl max-w-3xl">
                Connect donors with organizations fighting hunger. Our platform
                makes food donation simple, efficient, and impactful.
              </p>
              {!isAuthenticated && (
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link to="/register" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50">
                    Get Started
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                  <Link to="/login" className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-emerald-700">
                    Log in
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                  <div className="mt-10">
                    <Link
                        to={user?.role === 'ROLE_DONOR' ? '/donor/dashboard' : '/ngo/dashboard'}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-700 hover:bg-emerald-800"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
              )}
            </div>
            <div className="lg:w-1/2">
              <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="Food donation" className="rounded-lg shadow-xl" />
            </div>
          </div>
        </div>
        {/* How It Works */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Our platform connects food donors with NGOs to reduce waste and
                fight hunger.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-emerald-500 text-white">
                  <UtensilsIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">
                  Donors Share
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Restaurants, grocery stores, and individuals post details
                  about available food for donation.
                </p>
              </div>
              {/* Step 2 */}
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-emerald-500 text-white">
                  <BuildingIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">
                  NGOs Claim
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Local NGOs and food banks browse available donations and claim
                  what they need.
                </p>
              </div>
              {/* Step 3 */}
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-emerald-500 text-white">
                  <HeartHandshakeIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">
                  Communities Benefit
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Food reaches those in need, reducing waste and supporting
                  local communities.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* CTA */}
        <div className="bg-emerald-50">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              <span className="block">Ready to make a difference?</span>
              <span className="block text-emerald-600">
                Join our food sharing community today.
              </span>
            </h2>
            {!isAuthenticated && (
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link to="/register" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
                  Register Now
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link to="/login" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-gray-50">
                  Log in
                </Link>
              </div>
            </div>)}
          </div>
        </div>
      </main>
      <Footer />
    </div>;
};
export default Home;