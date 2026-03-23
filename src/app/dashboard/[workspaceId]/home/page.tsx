import { getHowToPost } from "@/actions/workspace";
import HowToPost from "@/components/global/how-to-post";

type Props = {
  params: Promise<{
    workspaceId: string;
  }>;
};

const HomePage = async ({ params }: Props) => {
  const { workspaceId } = await params;
  
  const post = await getHowToPost();

  return (
    <div className="flex flex-col gap-y-10">
      {post.status === 200 && post.data && (
        <HowToPost
          title={post.data.title}
          content={post.data.content}
        />
      )}
    </div>
  );
};

export default HomePage;
