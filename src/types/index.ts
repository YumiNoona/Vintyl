import { Plan } from "@/generated/prisma";

export type WorkspaceProps = {
  data: {
    subscription: {
      plan: Plan;
    } | null;
    workspace: {
      id: string;
      name: string;
      type: "PERSONAL" | "PUBLIC";
    }[];
    members: {
      workspace: {
        id: string;
        name: string;
        type: "PERSONAL" | "PUBLIC";
      };
    }[];
  };
};

export type NotificationProps = {
  status: number;
  data: {
    _count: {
      notification: number;
    };
    notification: {
      id: string;
      content: string;
      createdAt: Date;
    }[];
  };
};

export type FolderProps = {
  status: number;
  data: {
    id: string;
    name: string;
    createdAt: Date;
    _count: {
      videos: number;
    };
  }[];
};

export type VideosProps = {
  status: number;
  data: {
    id: string;
    title: string | null;
    description: string | null;
    createdAt: Date;
    source: string;
    processing: boolean;
    Folder: {
      id: string;
      name: string;
    } | null;
    User: {
      firstName: string | null;
      lastName: string | null;
      image: string | null;
    } | null;
  }[];
};

export type VideoProps = {
  status: number;
  data: {
    id: string;
    title: string | null;
    description: string | null;
    source: string;
    views: number;
    createdAt: Date;
    processing: boolean;
    summary: string | null;
    User: {
      firstName: string | null;
      lastName: string | null;
      image: string | null;
      clerkId: string;
      trial: {
        trial: boolean;
      } | null;
      subscription: {
        plan: Plan;
      } | null;
    } | null;
  };
  author: boolean;
};

export type CommentProps = {
  id: string;
  comment: string;
  reply: boolean;
  commentId: string | null;
  createdAt: Date;
  User: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  } | null;
};
