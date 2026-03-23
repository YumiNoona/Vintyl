"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, Play, Clock } from "lucide-react";

const data = [
  { name: "Mon", views: 400 },
  { name: "Tue", views: 300 },
  { name: "Wed", views: 200 },
  { name: "Thu", views: 278 },
  { name: "Fri", views: 189 },
  { name: "Sat", views: 239 },
  { name: "Sun", views: 349 },
];

export default function AnalyticsChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
      {/* Metrics Row */}
      <div className="lg:col-span-3 bg-secondary/20 border border-border rounded-3xl p-6 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">Performance Overview</h3>
            <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase font-black opacity-50">Views over last 7 days</p>
          </div>
          <div className="flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full text-xs font-bold border border-purple-500/20">
            <TrendingUp size={14} />
            +12.5% vs last week
          </div>
        </div>
        
        <div className="h-[240px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#737373', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#737373', fontSize: 12}}
                 dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#171717', 
                  border: '1px solid #262626',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: '#9333ea' }}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke="#a855f7" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorViews)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Cards Column */}
      <div className="flex flex-col gap-4">
        <div className="bg-secondary/20 border border-border rounded-2xl p-4 flex items-center justify-between group hover:bg-secondary/30 transition-all cursor-default overflow-hidden relative">
           <div className="absolute -right-2 -bottom-2 text-purple-500/5 rotate-12 group-hover:scale-110 transition-transform">
             <Play size={80} />
           </div>
           <div>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Total Plays</p>
             <h4 className="text-2xl font-black text-foreground mt-2">1,284</h4>
           </div>
           <div className="bg-purple-500/20 p-2.5 rounded-xl text-purple-500">
             <Play size={20} fill="currentColor" />
           </div>
        </div>

        <div className="bg-secondary/20 border border-border rounded-2xl p-4 flex items-center justify-between group hover:bg-secondary/30 transition-all cursor-default overflow-hidden relative">
           <div className="absolute -right-2 -bottom-2 text-blue-500/5 rotate-12 group-hover:scale-110 transition-transform">
              <Users size={80} />
           </div>
           <div>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Total Views</p>
             <h4 className="text-2xl font-black text-foreground mt-2">942</h4>
           </div>
           <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-500">
             <Users size={20} />
           </div>
        </div>

        <div className="bg-secondary/20 border border-border rounded-2xl p-4 flex items-center justify-between group hover:bg-secondary/30 transition-all cursor-default overflow-hidden relative">
           <div className="absolute -right-2 -bottom-2 text-amber-500/5 rotate-12 group-hover:scale-110 transition-transform">
             <Clock size={80} />
           </div>
           <div>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Avg Watch Time</p>
             <h4 className="text-2xl font-black text-foreground mt-2">2:45</h4>
           </div>
           <div className="bg-amber-500/20 p-2.5 rounded-xl text-amber-500">
             <Clock size={20} />
           </div>
        </div>
      </div>
    </div>
  );
}
