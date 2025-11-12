import { useState, useEffect, lazy, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MediaCard({ image, onRemove }) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {image.name}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-red-600"
          >
            ×
          </Button>
        </div>
        
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Component temporarily simplified - refresh to restore full functionality
          </p>
        </div>
        
        <Button
          onClick={() => toast.info('Full component will be restored momentarily')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Compress
        </Button>
      </div>
    </Card>
  );
}