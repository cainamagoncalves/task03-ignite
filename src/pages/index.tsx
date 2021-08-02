import Prismic from '@prismicio/client';
import { useState } from 'react';
import { FiCalendar, FiUser } from "react-icons/fi";

import { GetStaticProps } from 'next';
import Link from 'next/link'

import formatPosts from '../utils/formatPosts';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss'

export interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(formatPosts(postsPagination.results))
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page)
  
  async function handleGetNextPage() {
    const response = await fetch(nextPage)
    const data = await response.json()

    const activePosts = [...posts, ...formatPosts(data.results)]
    setPosts(activePosts)

    if (data.next_page) {
      setNextPage(data.next_page)
    } else {
      setNextPage(null)
    }
  }



  return (
    <>
      <main className={styles.container}>
        <div className={styles.containerContent}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`}>
            <a key={post.uid}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <time><FiCalendar />{post.first_publication_date}</time>
                <span><FiUser />{post.data.author}</span>
              </div>
            </a>
            </Link>

          ))}
        </div>
        {nextPage &&
          <button
            onClick={handleGetNextPage}
            type="button"
          >
            Carregar mais posts
          </button>
        }
      </main>

    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'po'),
  ], {
    pageSize: 1,
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results
  }
  
  // console.log(JSON.stringify(postsPagination, null, 2))

  return {
    props: {
      postsPagination,
    },
    revalidate: 1 * 60 * 60 // 1 hour
  };
};
