const PROJECT_ID = "hzsotwti";
const DATASET = "production";
const API_VERSION = "2024-01-01";

const BASE_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`;

// -----------------------------
// TYPES
// -----------------------------

type PortableTextChild = {
  text: string;
};

type PortableTextBlock = {
  _type: "block";
  children?: PortableTextChild[];
  style?: string;
  listItem?: "bullet" | "number";
};

type SanityPost = {
  _id: string;
  title: string;
  excerpt?: string;
  slug?: {
    current: string;
  };
  mainImage?: {
    asset: {
      _ref: string;
    };
  };
  publishedAt: string;
  body?: PortableTextBlock[];
};

export type MappedPost = {
  id: string;
  title: string;
  brief: string;
  slug: string;
  coverImage?: {
    url: string;
  };
  publishedAt: string;
  author: {
    name: string;
  };
  readTimeInMinutes: number;
  tags: [];
  content: PortableTextBlock[];
};

// -----------------------------
// FETCH HELPER
// -----------------------------

async function sanityFetch<T>(query: string): Promise<T> {
  const url = `${BASE_URL}?query=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch from Sanity");
  }

  const data = await res.json();
  return data.result;
}

// -----------------------------
// HELPERS
// -----------------------------

function extractExcerpt(blocks: PortableTextBlock[] = []): string {
  for (const block of blocks) {
    if (block._type === "block" && block.children) {
      const text = block.children.map((c) => c.text).join("");
      if (text.trim()) {
        return text.slice(0, 160);
      }
    }
  }
  return "";
}

function getImageUrl(ref: string): string {
  const parts = ref.split("-");
  const id = parts[1];
  const dimensions = parts[2];
  const format = parts[3];

  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dimensions}.${format}`;
}

// -----------------------------
// MAPPER
// -----------------------------

function mapPost(post: SanityPost): MappedPost {
  return {
    id: post._id,
    title: post.title,
    brief: post.excerpt || extractExcerpt(post.body),
    slug: post.slug?.current || "",
    coverImage: post.mainImage
      ? {
          url: getImageUrl(post.mainImage.asset._ref),
        }
      : undefined,
    publishedAt: post.publishedAt,
    author: {
      name: "MyFundingList",
    },
    readTimeInMinutes: 5,
    tags: [],
    content: post.body || [],
  };
}

// -----------------------------
// PUBLIC FUNCTIONS
// -----------------------------

export async function fetchSanityPosts(): Promise<MappedPost[]> {
  const query = `
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      excerpt,
      slug,
      mainImage,
      publishedAt,
      body
    }
  `;

  const posts = await sanityFetch<SanityPost[]>(query);
  return posts.map(mapPost);
}

export async function fetchSanityPost(
  slug: string
): Promise<MappedPost | null> {
  const query = `
    *[_type == "post" && slug.current == "${slug}"][0] {
      _id,
      title,
      excerpt,
      slug,
      mainImage,
      publishedAt,
      body
    }
  `;

  const post = await sanityFetch<SanityPost | null>(query);

  if (!post) return null;

  return mapPost(post);
}