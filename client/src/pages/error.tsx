import { Link } from 'react-router-dom';

const Error = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="text-9xl font-bold tracking-wider">404 - error</h1>
        <h2 className="text-5xl font-semibold uppercase">Page not found</h2>
        <p className="text-xl">Your search have gone beyond our knowledge.</p>
        <Link
          className="py-2 px-4 bg-primary hover:bg-secondary rounded-lg text-xl transition-colors"
          to="/"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default Error;
