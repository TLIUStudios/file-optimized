import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, MessageCircle, Share2, X } from "lucide-react";
import { toast } from "sonner";

export default function SocialShareModal({ isOpen, onClose, imageUrl, fileName }) {
  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`Check out my optimized image: ${fileName}`);

  const handleShare = (platform) => {
    let url;
    
    switch (platform) {
      case 'facebook':
        url = 'https://www.facebook.com';
        break;
      case 'twitter':
        url = 'https://twitter.com';
        break;
      case 'linkedin':
        url = 'https://www.linkedin.com';
        break;
      case 'whatsapp':
        url = 'https://web.whatsapp.com';
        break;
      case 'pinterest':
        url = 'https://www.pinterest.com';
        break;
      default:
        return;
    }

    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    // Disabled - no copying functionality
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="bg-slate-900/90 dark:bg-slate-900/90 hover:bg-red-600 dark:hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share to Social Media
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleShare('facebook')}
              className="w-full justify-start"
            >
              <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>

            <Button
              variant="outline"
              onClick={() => handleShare('twitter')}
              className="w-full justify-start"
            >
              <svg className="w-5 h-5 mr-2" fill="#000000" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X (Twitter)
            </Button>

            <Button
              variant="outline"
              onClick={() => handleShare('linkedin')}
              className="w-full justify-start"
            >
              <Linkedin className="w-5 h-5 mr-2 text-[#0A66C2]" />
              LinkedIn
            </Button>

            <Button
              variant="outline"
              onClick={() => handleShare('whatsapp')}
              className="w-full justify-start"
            >
              <MessageCircle className="w-5 h-5 mr-2 text-[#25D366]" />
              WhatsApp
            </Button>

            <Button
              variant="outline"
              onClick={() => handleShare('pinterest')}
              className="w-full justify-start"
            >
              <svg className="w-5 h-5 mr-2" fill="#E60023" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
              </svg>
              Pinterest
            </Button>

            <Button
              variant="secondary"
              onClick={handleCopyLink}
              className="w-full justify-start"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              Copy Link
            </Button>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="text-xs bg-slate-950 dark:bg-slate-950 rounded-lg p-4 border border-slate-800 dark:border-slate-800">
              <p className="text-slate-400 dark:text-slate-400"><span className="font-bold text-red-600 dark:text-red-400">Note:</span> <span className="italic">This feature is currently disabled as we don't store any files uploaded on the platform. All processing happens locally in your browser for maximum privacy and security.</span></p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}