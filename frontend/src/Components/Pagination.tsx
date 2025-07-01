import ReactPaginate from 'react-paginate';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { usePostStore } from '@/store/usePostStore';
import React, { useState, type SetStateAction } from 'react';
import { useLocation, useMatch } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';


interface ICheckStateFn {
    setShowComment: React.Dispatch<SetStateAction<boolean>>,
    setText: React.Dispatch<SetStateAction<string>>,
    setCheckPostId: React.Dispatch<SetStateAction<string | null>>,
}

function Pagination({ setShowComment, setText, setCheckPostId }: ICheckStateFn) {
    const { totalPages, setPage, myPosts, friendPosts } = usePostStore();
    const { userPosts } = useUserStore()
    const [selectedPage, setSelectedPage] = useState<number>(1);
    const location = useLocation();
    const isUserPage = useMatch('/user/:id');

    const handlePageClick = (data: { selected: number }) => {
        setShowComment(false);
        setText('');
        setCheckPostId('');
        const pageNum = data.selected + 1;
        setSelectedPage(pageNum);
        setPage(pageNum);
    }

    return (
        <>
            {(myPosts?.length > 0 && (location.pathname === '/profile' || location.pathname === '/book-marks')) || 
                (friendPosts?.length > 0 && location.pathname === '/') || 
                (userPosts?.length > 0 && isUserPage)
            ? (
                <ReactPaginate
                    breakLabel=".."
                    className='flex gap-2 text-center items-center justify-center relative font-secondry mt-8 mb-2 bg-secondary p-2 shadow-md flex-wrap'
                    nextLabel={<span className={`${totalPages === selectedPage ? 'opacity-[0.5] cursor-not-allowed' : 'opacity-[1] hover:bg-primary hover:text-white text-primary'} flex items-center gap-2 bg-offWhite px-4 py-2 rounded-md  transition-all duration-300 ease-in-out `}>Next<ChevronRight className="right" /></span>}
                    marginPagesDisplayed={2}
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={2}
                    pageCount={totalPages}
                    previousLabel={<span className={`${selectedPage === 1 ? 'opacity-[0.5] cursor-not-allowed' : 'opacity-[1] hover:bg-primary hover:text-white text-primary'} flex items-center gap-2 bg-offWhite text-primary px-4 py-2 rounded-md  transition-all duration-300 ease-in-out`}><ChevronLeft className="left" />Previous</span>}
                    renderOnZeroPageCount={null}
                    pageClassName='cursor-pointer rounded-md bg-offWhite'
                    pageLinkClassName='w-[40px] h-[40px] flex items-center justify-center text-primary hover:text-white hover:bg-primary rounded-md transition-all duration-300'
                    previousClassName=' text-white rounded-md prev'
                    nextClassName='text-primary rounded-md next'
                    breakClassName='rounded-md bg-offWhite text-[#23262A]'
                    breakLinkClassName='w-[40px] h-[40px] block flex items-center justify-center text-primary'
                    activeLinkClassName='bg-primary text-white'
                />
            ) : (
                <div className='text-center text-gray-500'>No Posts Yet</div>
            )}
        </>

    );
}

export default Pagination;