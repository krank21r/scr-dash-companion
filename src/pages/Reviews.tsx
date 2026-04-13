import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelUploader from '@/components/ExcelUploader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Star, FileCheck, ClipboardList, AlertCircle, ChevronLeft, ChevronRight, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewData {
  projectName: string;
  reviewer: string;
  date: string;
  comments: string;
  rating: number;
}

const Reviews = () => {
  const [reviewData, setReviewData] = useState<ReviewData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const validateReviewData = (data: any[]): { isValid: boolean; errors?: string[] } => {
    const requiredFields = ['projectName', 'reviewer', 'date', 'comments', 'rating'];
    const errors: string[] = [];
    if (data.length === 0) errors.push('Source dataset is void.');
    return { isValid: errors.length === 0, errors };
  };

  const handleFileUpload = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      const transformedData = jsonData.map((row: any) => ({
        projectName: row.projectName || row['Project Name'] || '-',
        reviewer: row.reviewer || row.Reviewer || 'Anonymous',
        date: row.date || row.Date || '-',
        comments: row.comments || row.Comments || '-',
        rating: Number(row.rating || row.Rating || 0),
      }));
      setReviewData(transformedData);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error('Incompatible format.');
    }
  };

  const totalPages = Math.ceil(reviewData.length / itemsPerPage);
  const currentItems = reviewData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          size={12} 
          className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-inner border border-violet-100/50">
            <ClipboardList size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">Project Audits</h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.1em] mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
              {reviewData.length} Review entries synchronized
            </p>
          </div>
        </div>
      </div>

      {/* Ingestion Hub */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 border-none shadow-premium-shadow overflow-hidden relative"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
              <FileCheck size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">Audit Log Import</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Batch processing for project reviews</p>
            </div>
          </div>
          <ExcelUploader onFileUpload={handleFileUpload} validateData={validateReviewData} />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </motion.div>

      {/* Audit Registry */}
      <AnimatePresence>
        {reviewData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card border-none shadow-premium-shadow overflow-hidden"
          >
            <div className="p-8 bg-slate-900 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-black text-white text-lg tracking-tight font-['Plus_Jakarta_Sans']">Compiled Reviews</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <ChevronLeft size={20} />
                </Button>
                <div className="px-4 py-1.5 rounded-xl bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/10">
                  Page {currentPage} of {totalPages}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="table-header-glow">
                  <tr className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 font-['Plus_Jakarta_Sans']">
                    <th className="px-8 py-6 w-[25%] font-black">Project Name</th>
                    <th className="px-6 py-6 w-[15%]">Reviewer</th>
                    <th className="px-6 py-6 w-[12%]">Timestamp</th>
                    <th className="px-6 py-6 w-[38%]">Commentary</th>
                    <th className="px-6 py-6 w-[10%] text-right pr-10">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {currentItems.map((review, index) => (
                    <tr key={index} className="premium-table-row transition-all duration-300 group">
                      <TableCell className="px-8 py-6 font-extrabold text-slate-800 text-sm group-hover:text-primary transition-colors">{review.projectName}</TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100"><User size={14} /></div>
                          <span className="text-xs font-bold text-slate-600">{review.reviewer}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-xs font-bold text-slate-400 font-mono">{review.date}</TableCell>
                      <TableCell className="px-6 py-6 text-sm text-slate-500 font-medium leading-relaxed italic">"{review.comments}"</TableCell>
                      <TableCell className="px-6 py-6 text-right pr-10">
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-sm font-black text-slate-900">{review.rating.toFixed(1)}</span>
                          <RatingStars rating={review.rating} />
                        </div>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {reviewData.length === 0 && (
        <div className="py-24 text-center">
          <div className="mx-auto w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
            <ClipboardList size={32} className="text-slate-200" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Oversight Required</p>
        </div>
      )}
    </div>
  );
};

export default Reviews;