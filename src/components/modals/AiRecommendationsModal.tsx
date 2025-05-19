'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { AiRecommendationsData } from '@/types/org-chart';
import { ThumbsUp, AlertTriangle } from 'lucide-react';

interface AiRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendationsData: AiRecommendationsData | null;
  isLoading: boolean;
}

export function AiRecommendationsModal({ isOpen, onClose, recommendationsData, isLoading }: AiRecommendationsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ThumbsUp className="mr-2 h-5 w-5 text-primary" />
            AI Hierarchy Recommendations
          </DialogTitle>
          <DialogDescription>
            Based on organizational best practices, here are some suggested optimizations.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-3">
          {isLoading && <p className="text-center p-4">Loading recommendations...</p>}
          {!isLoading && !recommendationsData && (
            <div className="text-center p-4 text-muted-foreground">
              <AlertTriangle className="mx-auto h-10 w-10 mb-2" />
              No recommendations available or an error occurred.
            </div>
          )}
          {!isLoading && recommendationsData && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Summary</h3>
                <p className="text-sm text-muted-foreground">{recommendationsData.summary}</p>
              </div>
              {recommendationsData.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 mt-4">Specific Recommendations</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {recommendationsData.recommendations.map((rec, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-base hover:no-underline">
                          <span className="font-medium">{rec.area}:</span> <span className="ml-1 font-normal truncate max-w-xs md:max-w-md">{rec.optimization.substring(0,50)}{rec.optimization.length > 50 ? "..." : ""}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm space-y-2">
                          <p><strong>Optimization:</strong> {rec.optimization}</p>
                          <p><strong>Potential Impact:</strong> {rec.potentialImpact}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
