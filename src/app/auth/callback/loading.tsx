import Loader from "@/components/global/loader";

export default function AuthLoading() {
  return (
    <div className="flex h-screen w-full justify-center items-center">
      <Loader state>Loading...</Loader>
    </div>
  );
}
