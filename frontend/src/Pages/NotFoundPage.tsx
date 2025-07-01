import notFoundPage from '@/assets/notFound.jpg';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <img
                src={notFoundPage}
                alt="Not Found Page"
                className="w-[250px] sm:w-[300px] md:w-[600px] mb-6"
            />
            <h1 className="text-2xl md:text-4xl font-semibold text-gray-800 mb-8">
                404 - Page Not Found
            </h1>
            <Link
                to="/"
                className="bg-primary hover:bg-primary/90 transition text-white px-6 py-2 rounded-md text-sm md:text-base"
            >
             Home
            </Link>
        </div>
    );
}
