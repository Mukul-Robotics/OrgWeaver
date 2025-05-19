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
import type { ReorganizationSummaryData } from '@/types/org-chart';
import { ArrowRightLeft, TrendingUp, TrendingDown, ListChecks, PlusCircle, MinusCircle } from 'lucide-react';

interface ReorganizationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryData: ReorganizationSummaryData | null;
  isLoading: boolean;
}

export function ReorganizationSummaryModal({ isOpen, onClose, summaryData, isLoading }: ReorganizationSummaryModalProps) {
  const costChangeColor = summaryData && summaryData.costChange > 0 ? 'text-red-600' : 'text-green-600';
  const costChangeIcon = summaryData && summaryData.costChange > 0 ? <TrendingUp className="inline mr-1 h-4 w-4" /> : <TrendingDown className="inline mr-1 h-4 w-4" />;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ArrowRightLeft className="mr-2 h-5 w-5 text-primary" />
            Reorganization Impact Summary
          </DialogTitle>
          <DialogDescription>
            Summary of changes resulting from the recent reorganization.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-3">
          {isLoading && <p className="text-center p-4">Loading summary...</p>}
          {!isLoading && !summaryData && <p className="text-center p-4 text-muted-foreground">No summary data available.</p>}
          {!isLoading && summaryData && (
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-1">Overall Summary:</h3>
                <p className="text-muted-foreground">{summaryData.summary}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Cost Change:</h3>
                <p className={`${costChangeColor} font-medium flex items-center`}>
                  {costChangeIcon}
                  {summaryData.costChange >= 0 ? '+' : ''}${summaryData.costChange.toLocaleString()}
                </p>
              </div>
              
              {summaryData.jobsAdded.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-1 flex items-center"><PlusCircle className="mr-2 h-4 w-4 text-green-600" />Jobs Added:</h3>
                  <ul className="list-disc list-inside pl-2 text-muted-foreground">
                    {summaryData.jobsAdded.map((job, i) => <li key={`added-${i}`}>{job}</li>)}
                  </ul>
                </div>
              )}

              {summaryData.jobsRemoved.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-1 flex items-center"><MinusCircle className="mr-2 h-4 w-4 text-red-600" />Jobs Removed:</h3>
                  <ul className="list-disc list-inside pl-2 text-muted-foreground">
                    {summaryData.jobsRemoved.map((job, i) => <li key={`removed-${i}`}>{job}</li>)}
                  </ul>
                </div>
              )}
              
              {summaryData.jobsCovered.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-1 flex items-center"><ListChecks className="mr-2 h-4 w-4 text-blue-600" />Jobs Covered:</h3>
                  <ul className="list-disc list-inside pl-2 text-muted-foreground">
                    {summaryData.jobsCovered.map((job, i) => <li key={`covered-${i}`}>{job}</li>)}
                  </ul>
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
