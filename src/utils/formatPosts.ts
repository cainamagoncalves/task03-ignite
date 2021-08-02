import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { Post } from '../pages/index'

export default function formatPosts(postData: Post[]) {
  const posts = postData.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  })

  return posts;
}