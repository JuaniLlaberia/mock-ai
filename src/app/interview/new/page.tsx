import Link from 'next/link';
import { HiOutlineChevronLeft } from 'react-icons/hi2';

import Logo from '@/components/Logo';
import NewInterviewForm from './(components)/NewInterviewForm';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NewInterviewPage = () => {
  return (
    <section className='h-full w-full flex flex-col items-center justify-center'>
      <div className='w-full max-w-[550px] px-6'>
        <NewInterviewForm />
      </div>
      <div className='flex items-center justify-between w-full absolute top-4 left-0 px-4 md:px-16 lg:px-32 xl:px-56'>
        <Link
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'group'
          )}
          href='/dashboard/interviews'
        >
          <HiOutlineChevronLeft className='size-4 mr-1.5 group-hover:-translate-x-1 transition-transform' />{' '}
          Go back
        </Link>
        <Logo />
      </div>
    </section>
  );
};

export default NewInterviewPage;
