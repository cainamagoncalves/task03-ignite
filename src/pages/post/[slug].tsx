import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns'
import { FiCalendar, FiUser, FiClock } from "react-icons/fi";

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  const words = post.data.content.map(p => {
    return {
      wordsInHeading: p.heading.split(' ').length,
      wordsInBody: p.body.map(b => {
        return b.text.split(' ').length
      }).reduce((acc, cur) => acc += cur)
    }
  });

  const totalWords = words.map(e => e.wordsInHeading + e.wordsInBody)
    .reduce((acc, cur) => acc + cur)


  const timeToRead = Math.ceil(totalWords / 200) + ' min'

  return (
    <>
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>
      <div className={styles.container}>
        <header>
          <h1>{post.data.title}</h1>
          <div>
            <time><FiCalendar />{format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            )}</time>
            <p><FiUser />{post.data.author}</p>
            <span><FiClock />{timeToRead}</span>
          </div>
        </header>
        {post.data.content.map(p => (
          <article key={p.heading}>
            <h1>{p.heading}</h1>
            <div
              dangerouslySetInnerHTML={{ __html: RichText.asHtml(p.body) }}
            />
          </article>
        ))}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'po')
  ]);

  const paths = posts.results.map(post => ({
    params: { slug: post.uid }
  }));

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('po', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        }
      })
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24 // 1 hour
  }
};
