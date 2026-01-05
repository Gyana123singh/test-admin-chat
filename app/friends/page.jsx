// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import Link from "next/link";
// import FriendCard from "@/components/FriendCard";

// export default function FriendsPage() {
//   const [token, setToken] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [friends, setFriends] = useState([]);
//   const [filteredFriends, setFilteredFriends] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const authToken = localStorage.getItem("authToken");
//       const storedUserId = localStorage.getItem("userId");

//       if (!authToken) {
//         router.push("/login");
//         return;
//       }

//       setToken(authToken);
//       setUserId(storedUserId);
//     }
//   }, [router]);

//   const fetchFriends = async () => {
//     if (!token) return;

//     try {
//       const response = await axios.get(`${BASE_URL}/api/friends/list`, {
//         headers: { Authorization: `Bearer ${token}` },
//         withCredentials: true,
//       });

//       setFriends(response.data);
//       setFilteredFriends(response.data);
//       console.log("✅ Friends loaded:", response.data.length);
//     } catch (err) {
//       console.error("Error fetching friends:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       fetchFriends();
//     }
//   }, [token]);

//   useEffect(() => {
//     if (searchTerm.trim() === "") {
//       setFilteredFriends(friends);
//     } else {
//       const filtered = friends.filter((friend) => {
//         const friendData =
//           friend.from._id ===
//           JSON.parse(localStorage.getItem("userData") || "{}").id
//             ? friend.to
//             : friend.from;
//         return friendData.username
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase());
//       });
//       setFilteredFriends(filtered);
//     }
//   }, [searchTerm, friends]);

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
//           <h1 className="text-3xl font-bold text-gray-900">My Friends</h1>
//           <Link
//             href="/"
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
//           >
//             ← Back
//           </Link>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="mb-6">
//           <input
//             type="text"
//             placeholder="Search friends..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>

//         {loading ? (
//           <div className="text-center">
//             <p className="text-gray-600">Loading friends...</p>
//           </div>
//         ) : filteredFriends.length === 0 ? (
//           <div className="text-center bg-white rounded-lg p-8 shadow">
//             <p className="text-gray-600 text-lg">
//               {searchTerm ? "No friends match your search" : "No friends yet"}
//             </p>
//             <Link
//               href="/"
//               className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Go to Dashboard
//             </Link>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredFriends.map((friend) => (
//               <FriendCard key={friend._id} friend={friend} token={token} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
