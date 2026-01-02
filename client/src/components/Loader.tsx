export default function Loader() {
    return (
       <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <div className="w-3 h-3 bg-accent rounded-full"></div>
        </div>
      </div>
    )
}