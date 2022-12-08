import type { GetServerSideProps, NextPage } from "next";
import Router from "next/router";
import { format } from "path";
import { useState } from "react";
import prisma from '../lib/prisma'
import { useRouter } from "next/router";

interface Posts {
  posts: {
    id: string
    title: string
    content: string
  }[]
}

interface FormData {
  title: string
  content: string
  id: string
}

const Home = ({posts}: Posts) => {
  const [form, setForm] = useState<FormData>({title: '', content: '', id: ''})
  const router = useRouter()

  const refreshData = () => {
    router.replace(router.asPath)
  }

  async function create(data: FormData) {
    try {
      fetch(`http://localhost:3000/api/create`, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }).then(() => {
        setForm({title: '', content: '', id: ''}),
        refreshData();
      })
    } catch (error){
      console.log(error);
    }
  }

  async function deletePost(id: string) {
    try {
      fetch(`http://localhost:3000/api/post/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: 'DELETE'
      }).then(() => {
        refreshData()
      })
    } catch (error) {
      console.log(error);
    }
  }

  const handleSubmit = async (data: FormData) => {
    try {
      create(data)
    } catch (error) {
      console.log(error);
    }
  }

  return(
  <div>
    <h1>Blogs</h1>
    <form onSubmit={e => {
      e.preventDefault()
      handleSubmit(form)
    }}>
      <input type="text" 
        placeholder="Title"
        value={form.title}
        onChange={e => setForm({...form, title: e.target.value})}
      />
      <textarea
        placeholder="Content"
        value={form.content}
        onChange={e => setForm({...form, content: e.target.value})}
      />
      <button type="submit">ADD</button>

    </form>
    <div>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
              <div>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
              </div>
              <button onClick={() => deletePost(post.id)}>
                x
              </button>
          </li>
        ))}
      </ul>
    </div>
  </div>)
}

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const posts = await prisma?.post.findMany({
    select: {
      title: true,
      id: true,
      content: true
    }
  }
    
  )
  return {
    props: {
      posts
    }
  }
}