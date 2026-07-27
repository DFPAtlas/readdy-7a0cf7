"use client";

import Link from "next/link";

export interface ActivityItem {
  id: string;
  description: string;
  record: string;
  time: string;
  icon: string;
  iconColor: string;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  isLoading: boolean;
}

export default function RecentActivityFeed({ activities, isLoading }: RecentActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden animate-pulse">
        <div className="px-5 py-4 border-b border-[#D5D9D5]">
          <div className="h-5 w-32 bg-[#EBE5DA] rounded"></div>
        </div>
        <div className="p-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#EBE5DA] rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-[#EBE5DA] rounded"></div>
                <div className="h-3 w-1/2 bg-[#EBE5DA] rounded mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#D5D9D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8A9FB0]/10 rounded-lg flex items-center justify-center">
              <i className="ri-history-line text-[#8A9FB0] text-lg"></i>
            </div>
            <div>
              <h2 className="font-semibold text-[#3A3F3A]">Recent Activity</h2>
              <p className="text-xs text-[#687068]">No recent events</p>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 mx-auto bg-[#8A9FB0]/10 rounded-full flex items-center justify-center mb-3">
            <i className="ri-inbox-line text-[#8A9FB0] text-xl"></i>
          </div>
          <p className="text-sm font-medium text-[#3A3F3A]">No recent activity</p>
          <p className="text-xs text-[#687068] mt-1">Activity will appear here as you use LetHub.</p>
        </div>
      </div>
    );
  }

  const displayedActivities = activities.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#7A9A7E]/10 rounded-lg flex items-center justify-center">
            <i className="ri-history-line text-[#7A9A7E] text-lg"></i>
          </div>
          <div>
            <h2 className="font-semibold text-[#3A3F3A]">Recent Activity</h2>
            <p className="text-xs text-[#687068]">Latest {displayedActivities.length} events</p>
          </div>
        </div>
        <Link href="/dashboard/notifications" className="text-sm text-[#C28A78] font-medium hover:underline whitespace-nowrap">
          View all activity
        </Link>
      </div>

      <div className="divide-y divide-[#F1F5F9]">
        {displayedActivities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3 px-5 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${activity.iconColor}15` }}>
              <i className={`${activity.icon} text-sm`} style={{ color: activity.iconColor }}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#3A3F3A]">{activity.description}</p>
              <p className="text-xs text-[#687068] mt-0.5 truncate">{activity.record}</p>
            </div>
            <span className="text-xs text-[#687068] whitespace-nowrap flex-shrink-0">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}