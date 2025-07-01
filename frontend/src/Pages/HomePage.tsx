import PostCard from "@/Components/PostCard";
import ShowFriendPosts from "@/Components/ShowFriendPosts";
import { usePostStore } from "@/store/usePostStore"
import { useEffect } from "react"

export default function HomePage() {
  const { getFriendPosts, page } = usePostStore();

  useEffect(() => {
    getFriendPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="flex-1">
      <PostCard />
      <ShowFriendPosts />
    </div>
  )
}
