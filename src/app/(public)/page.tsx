import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { authClient } from "@/lib/auth-client"; // import the auth client
import {
  BookIcon,
  Gamepad,
  GitGraph,
  LucideIcon,
  PersonStanding,
  User2,
} from "lucide-react";
import Link from "next/link";

interface featuresProps {
  title: string;
  desciption: string;
  icon: LucideIcon;
}

const features: featuresProps[] = [
  {
    title: "Comprehensive Courses",
    desciption:
      "Access a wide range of carefully curated courses designed by industry experts.",
    icon: BookIcon,
  },
  {
    title: "Interactive Learning",
    desciption:
      "Engage with hands-on learning experiences that enhance understanding and retention.",
    icon: Gamepad,
  },
  {
    title: "Progress Tracking",
    desciption:
      "Track your learning journey with detailed progress reports and analytics.",
    icon: GitGraph,
  },
  {
    title: "Personalized Learning Paths",
    desciption:
      "Receive tailored recommendations based on your learning goals and progress.",
    icon: PersonStanding,
  },
  {
    title: "Community Support",
    desciption:
      "Join a vibrant community of learners and educators for support and collaboration.",
    icon: User2,
  },
];

export default function Home() {
  return (
    <>
      <section className="relative py-20">
        <div className="flex flex-col items-center tex-center space-y-8">
          <Badge variant="outline">The Future of Online Tech Education </Badge>
          <h1 className="text-4xl md:text-6xl font-bold  mt-8 tracking-tight">
            Elevate your Learning Experience
          </h1>
          <p className="max-w-175 text-muted-foreground md:text-xl">
            Discover a new way to learn with our modern, Interactive learning
            management system. Access high-quality courses and resources from
            industry experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href="/courses"
              className={buttonVariants({
                size: "lg",
              })}
            >
              Explore Courses
            </Link>
            <Link
              href="/auth/signup"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
              })}
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {features.map((feature, index) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="h-6 w-6 text-primary mb-4" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.desciption}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
