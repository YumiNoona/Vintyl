"use client";

import React from "react";

import { 
  Pencil, 
  Trash2, 
  Upload, 
  Copy, 
  Check, 
  Scissors, 
  Music, 
  Layout, 
  X,
  ChevronRight,
  Folder as FolderIcon,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getWorkspaceFolders } from "@/actions/workspace";
import { Loader2 } from "lucide-react";

type RecordPreviewProps = {
  video: string;
  onUpload: (folderId?: string) => void;
  onDiscard: () => void;
  isUploading?: boolean;
  videoId?: string;
  workspaceId?: string;
};

type Step = "PREVIEW" | "CHOOSING_FOLDER";

export default function RecordPreview({
  video,
  onUpload,
  onDiscard,
  isUploading,
  videoId,
  workspaceId
}: RecordPreviewProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [step, setStep] = React.useState<Step>("PREVIEW");
  const [folders, setFolders] = React.useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | undefined>();
  const [isLoadingFolders, setIsLoadingFolders] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const videoUrl = videoId ? `${window.location.origin}/preview/${videoId}` : "";

  React.useEffect(() => {
    if (workspaceId && step === "CHOOSING_FOLDER") {
      setIsLoadingFolders(true);
      getWorkspaceFolders(workspaceId)
        .then((res) => {
          if (res.status === 200) setFolders(res.data);
        })
        .finally(() => setIsLoadingFolders(false));
    }
  }, [workspaceId, step]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const link = document.createElement("a");
    link.href = video;
    link.download = `vintyl-export-${Date.now()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exporting your video...");
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="h-20 border-b border-border flex items-center justify-between px-8 bg-card">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary" onClick={() => setIsEditing(false)}>
              <X size={22} className="text-muted-foreground" />
            </Button>
            <div className="flex items-center gap-3">
              <h2 className="font-black text-2xl tracking-tighter uppercase italic">Vintyl Editor</h2>
              <span className="text-[10px] font-black bg-foreground text-background px-3 py-1 rounded-full uppercase tracking-widest">Beta</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="outline" className="h-12 px-8 rounded-2xl border-2 border-border font-bold uppercase tracking-widest text-xs" onClick={() => setIsEditing(false)}>Cancel</Button>
             <Button className="h-12 px-8 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-xs shadow-2xl" onClick={() => setIsEditing(false)}>Save Changes</Button>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 bg-black/95 flex items-center justify-center p-12">
            <div className="aspect-video w-full max-w-5xl bg-neutral-900 rounded-[3rem] overflow-hidden border-4 border-white/10 relative shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
              <video src={video} controls className="w-full h-full object-contain" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            </div>
          </div>
          
          <div className="w-96 border-l border-border bg-card p-8 flex flex-col gap-10">
             <div className="space-y-6">
               <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4">Editing Suite</h3>
               
               <Button 
                variant="outline" 
                className="w-full h-16 justify-between px-6 rounded-3xl border-2 border-border hover:border-foreground/20 hover:bg-secondary group transition-all"
                onClick={() => toast.info("AI Clipping is analyzing your video...")}
               >
                 <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-all">
                      <Scissors size={20} />
                    </div>
                    <span className="font-bold text-sm">Cut & Trim</span>
                 </div>
                 <ChevronRight size={16} className="text-muted-foreground" />
               </Button>

               <Button 
                variant="outline" 
                className="w-full h-16 justify-between px-6 rounded-3xl border-2 border-border hover:border-foreground/20 hover:bg-secondary group transition-all"
                onClick={() => toast.info("Adjusting canvas aspect ratio...")}
               >
                 <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <Layout size={20} />
                    </div>
                    <span className="font-bold text-sm">Canvas Size</span>
                 </div>
                 <ChevronRight size={16} className="text-muted-foreground" />
               </Button>

               <Button 
                variant="outline" 
                className="w-full h-16 justify-between px-6 rounded-3xl border-2 border-border hover:border-foreground/20 hover:bg-secondary group transition-all"
                onClick={() => toast.info("Library loading...")}
               >
                 <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      <Music size={20} />
                    </div>
                    <span className="font-bold text-sm">Background Music</span>
                 </div>
                 <ChevronRight size={16} className="text-muted-foreground" />
               </Button>
             </div>

             <div className="space-y-4">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4">Export</h3>
                <Button 
                  className="w-full h-16 rounded-3xl bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-xs shadow-2xl gap-4"
                  onClick={handleExport}
                >
                  <Download size={20} />
                  Export MP4
                </Button>
                <p className="text-[10px] text-center text-muted-foreground font-bold px-4">
                  Exporting will process your video for high-performance delivery.
                </p>
             </div>
             
             <div className="mt-auto p-6 bg-secondary/50 rounded-3xl border-2 border-border">
               <div className="flex items-center gap-3 mb-2">
                 <div className="size-2 rounded-full bg-purple-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-foreground">AI Scanning</span>
               </div>
               <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                 AI is scanning your clip for optimal cut points and silent gaps to remove.
               </p>
             </div>
          </div>
        </div>
        
        <div className="h-28 border-t border-border bg-card p-6 relative">
             <div className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-transparent" style={{ width: '40%' }} />
             <div className="flex items-center justify-center h-full text-muted-foreground text-xs font-black uppercase tracking-[0.3em] italic opacity-50">
                Advanced Timeline editing is coming soon.
             </div>
        </div>
      </div>
    );
  }

  if (step === "CHOOSING_FOLDER") {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-2xl flex items-center justify-center z-50 p-6">
        <div className="bg-card rounded-[3rem] p-12 w-full max-w-xl border-2 border-border shadow-[0_80px_200px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">Select Folder</h2>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed">Where should we save this Vintyl?</p>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
               {isLoadingFolders ? (
                 <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="animate-spin text-purple-500" size={40} />
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fetching Folders...</span>
                 </div>
               ) : folders.length > 0 ? (
                 <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setSelectedFolderId(undefined)}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${!selectedFolderId ? 'border-foreground bg-secondary' : 'border-border hover:border-foreground/20'}`}
                    >
                      <div className={`p-3 rounded-xl ${!selectedFolderId ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'}`}>
                        <FolderIcon size={20} />
                      </div>
                      <div>
                        <span className="font-black text-sm block uppercase tracking-tight">Root Directory</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Workspace Main</span>
                      </div>
                    </button>
                    {folders.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFolderId(f.id)}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${selectedFolderId === f.id ? 'border-foreground bg-secondary' : 'border-border hover:border-foreground/20'}`}
                      >
                        <div className={`p-3 rounded-xl ${selectedFolderId === f.id ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'}`}>
                          <FolderIcon size={20} />
                        </div>
                        <div>
                          <span className="font-black text-sm block uppercase tracking-tight">{f.name}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{f._count.videos} Videos</span>
                        </div>
                      </button>
                    ))}
                 </div>
               ) : (
                 <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl">
                    <p className="text-sm font-bold text-muted-foreground mb-4">No folders found in this workspace.</p>
                    <Button variant="outline" className="rounded-xl" onClick={() => setSelectedFolderId(undefined)}>
                       Save to Root
                    </Button>
                 </div>
               )}
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              <Button 
                className="w-full h-16 rounded-3xl bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-xs shadow-2xl"
                onClick={() => onUpload(selectedFolderId)}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="animate-spin" /> : "Confirm Upload"}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full h-14 rounded-2xl font-bold text-muted-foreground hover:text-foreground"
                onClick={() => setStep("PREVIEW")}
                disabled={isUploading}
              >
                Back to Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-[2.5rem] p-8 w-full max-w-[900px] border border-border shadow-3xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-purple-600/5 blur-[120px] -z-10" />

        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="flex-1 w-full">
            <div className="rounded-[2rem] overflow-hidden bg-black aspect-video border border-border/50 shadow-2xl group relative">
              <video
                src={video}
                controls
                autoPlay
                className="w-full h-full"
              />
            </div>
          </div>
          
          <div className="w-full md:w-64 space-y-6">
            {!videoId ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Review Recording</h3>
                  <p className="text-muted-foreground text-sm">Preview your Vintyl before sharing it with your team.</p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    className="w-full bg-foreground text-background hover:bg-foreground/90 h-16 rounded-[2rem] font-black uppercase tracking-widest text-xs gap-4 shadow-3xl active:scale-95 transition-all"
                    onClick={() => setStep("CHOOSING_FOLDER")}
                    disabled={isUploading}
                  >
                    <Upload size={20} />
                    Upload to Library
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-border hover:bg-secondary text-foreground h-14 rounded-2xl font-bold gap-3 active:scale-95 transition-all"
                    onClick={() => setIsEditing(true)}
                    disabled={isUploading}
                  >
                    <Pencil size={18} /> Edit Clip
                  </Button>

                  <Button 
                    variant="ghost"
                    className="w-full text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 h-14 rounded-2xl font-bold gap-3 active:scale-95 transition-all"
                    onClick={onDiscard}
                    disabled={isUploading}
                  >
                    <Trash2 size={18} /> Delete Recording
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3 text-green-600 dark:text-green-400">
                  <Check size={20} className="shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-widest">Successfully Uploaded</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2">Share this Vintyl</h4>
                    <div className="flex gap-2">
                       <div className="flex-1 bg-secondary border border-border px-4 py-3 rounded-xl text-xs text-muted-foreground truncate">
                          {videoUrl}
                       </div>
                       <Button 
                         size="icon" 
                         className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shrink-0"
                         onClick={copyToClipboard}
                       >
                         {copied ? <Check size={16} /> : <Copy size={16} />}
                       </Button>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-foreground text-background hover:bg-foreground/90 h-14 rounded-2xl font-bold shadow-xl active:scale-95 transition-all"
                    onClick={() => window.location.href = `/dashboard/${workspaceId}`}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 py-4 px-6 bg-secondary/50 rounded-2xl border border-border text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
           <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
           Web Recording • WebM Format • High Fidelity
        </div>
      </div>
    </div>
  );
}
