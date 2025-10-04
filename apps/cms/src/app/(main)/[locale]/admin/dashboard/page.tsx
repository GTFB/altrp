import { Card, Title, BarChart, DonutChart } from '@tremor/react';
import { PostRepository } from '@/repositories/post.repository';

export default async function DashboardPage() {
  const postRepo = PostRepository.getInstance();
  const posts = await postRepo.findAll();
  
  const postsByMonth = posts.reduce((acc, post) => {
    if (!post.date) return acc;
    const month = new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const tagStats = posts.reduce((acc, post) => {
    post.tags?.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const chartData = Object.entries(postsByMonth).map(([month, count]) => ({
    month,
    posts: count,
  }));
  
  const donutData = Object.entries(tagStats).map(([tag, count]) => ({
    name: tag,
    value: count,
  }));
  
  return (
    <div className="p-6 space-y-6">
      <Title>Dashboard</Title>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Title>Posts by Month</Title>
          <BarChart
            data={chartData}
            index="month"
            categories={['posts']}
            colors={['blue']}
          />
        </Card>
        
        <Card>
          <Title>Posts by Tags</Title>
          <DonutChart
            data={donutData}
            category="value"
            index="name"
            colors={['slate', 'violet', 'indigo', 'rose', 'cyan', 'amber']}
          />
        </Card>
      </div>
    </div>
  );
}
