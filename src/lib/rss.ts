import { PostRepository } from '@/repositories/post.repository';
import { siteConfig } from '@/config/site';

export async function generateRssFeed() {
  const postRepo = PostRepository.getInstance();
  const posts = await postRepo.findAll();
  
  const rssItems = posts.map((post) => ({
    title: post.title,
    description: post.excerpt,
    url: `${siteConfig.url}/blog/${post.slug}`,
    date: post.date,
  }));
  
  return rssItems;
}
