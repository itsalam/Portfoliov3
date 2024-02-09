export default function Loading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center w-full h-full bg-[#121212]">
      <div className="flex items-center justify-center space-x-4">
        <div className="w-6 h-6 bg-[#666666] rounded-full animate-bounce" />
        <div className="w-6 h-6 bg-[#666666] rounded-full animate-bounce" />
        <div className="w-6 h-6 bg-[#666666] rounded-full animate-bounce" />
      </div>
    </div>
  );
}
