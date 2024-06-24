'use client';

import { RegisterLink } from '@kinde-oss/kinde-auth-nextjs';
import { FcGoogle } from 'react-icons/fc';

import { buttonVariants } from '../ui/button';
import { cn } from '@/lib/utils';

const GoogleAuthBtn = ({ className }: { className?: string }) => {
  return (
    <RegisterLink
      className={cn(
        buttonVariants({}),
        'bg-white text-black border border-border hover:bg-[#f3f3f3] dark:bg-background-2 dark:text-primary dark:hover:bg-[#2b2b2b59] font-medium w-full',
        className
      )}
      authUrlParams={{
        connection_id: process.env
          .NEXT_PUBLIC_KINDE_CONNECTION_GOOGLE as string,
      }}
    >
      <FcGoogle className='size-5 mr-2' />
      Continue with Google
    </RegisterLink>
  );
};

export default GoogleAuthBtn;
