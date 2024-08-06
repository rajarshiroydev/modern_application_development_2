# @app.route("/api/sections", methods=["GET"])
# @auth_required
# def get_sections():
#     parameter = request.args.get("parameter")
#     query = request.args.get("query")

#     # Initialize query for sections
#     sections_query = Section.query

#     # Filter sections based on parameter
#     if parameter == "section_name":
#         sections_query = sections_query.filter(Section.name.ilike(f"%{query}%"))
#     elif parameter == "book_name":
#         sections_query = sections_query.join(Section.books).filter(
#             Books.name.ilike(f"%{query}%")
#         )
#     elif parameter == "author_name":
#         sections_query = sections_query.join(Section.books).filter(
#             Books.author.ilike(f"%{query}%")
#         )

#     # Get filtered sections
#     sections = sections_query.all()

#     # Filter books within each section
#     for section in sections:
#         if parameter == "book_name":
#             section.books = [
#                 book for book in section.books if query.lower() in book.name.lower()
#             ]
#         elif parameter == "author_name":
#             section.books = [
#                 book for book in section.books if query.lower() in book.author.lower()
#             ]

#     # Serialize sections with their books
#     sections_data = [
#         {
#             "id": section.id,
#             "name": section.name,
#             "books": [
#                 {"id": book.id, "name": book.name, "author": book.author}
#                 for book in section.books
#             ],
#         }
#         for section in sections
#     ]

#     return jsonify({"sections": sections_data})


# @app.route("/api/sections", methods=["GET"])
# @auth_required
# def get_sections():
#     parameter = request.args.get("parameter")
#     query = request.args.get("query")

#     # Filter sections based on parameter
#     if parameter == "section_name":
#         sections = Section.query.filter(Section.name.ilike(f"%{query}%")).all()
#     elif parameter == "book_name":
#         sections = [
#             section
#             for section in Section.query.all()
#             if any(query.lower() in book.name.lower() for book in section.books)
#         ]
#     elif parameter == "author_name":
#         sections = [
#             section
#             for section in Section.query.all()
#             if any(query.lower() in book.author.lower() for book in section.books)
#         ]
#     else:
#         sections = []

#     # Filter books within each section
#     for section in sections:
#         if parameter == "book_name":
#             section.books = [
#                 book for book in section.books if query.lower() in book.name.lower()
#             ]
#         elif parameter == "author_name":
#             section.books = [
#                 book for book in section.books if query.lower() in book.author.lower()
#             ]

#     return jsonify({"sections": [section.id for section in sections]})


# <template>
#   <div>
#     <h1 class="display-1">User Requests</h1>
#     <hr>
#     <table v-if="requests.length > 0" class="table">
#       <thead>
#         <tr>
#           <th>User ID</th>
#           <th>Username</th>
#           <th>Book Name</th>
#           <th>Author</th>
#           <th>Issue Date</th>
#           <th>Return Date</th>
#           <th>Access</th>
#         </tr>
#       </thead>
#       <tbody>
#         <tr v-for="request in requests" :key="request.id">
#           <td>{{ request.user_id }}</td>
#           <td>{{ request.username }}</td>
#           <td>{{ request.book.name }}</td>
#           <td>{{ request.book.author }}</td>
#           <td>{{ request.book.date_issued }}</td>
#           <td>{{ request.book.return_date }}</td>
#           <td>
#             <button class="btn btn-success" @click="grantRequest(request.id)">
#               <i class="fas fa-plus"></i> Grant
#             </button>
#             <button class="btn btn-danger" @click="rejectRequest(request.id)">
#               <i class="fas fa-ban"></i> Reject
#             </button>
#           </td>
#         </tr>
#       </tbody>
#     </table>
#     <div v-else>
#       <h1 class="display-1">No User Requests Currently</h1>
#       <hr>
#     </div>
#   </div>
# </template>

# <script>
# export default {
#   data() {
#     return {
#       requests: [],
#     };
#   },
#   mounted() {
#     this.fetchRequests();
#   },
#   methods: {
#     async fetchRequests() {
#       try {
#         const response = await fetch('/api/requests', {
#           method: 'GET',
#           headers: {
#             'Content-Type': 'application/json',
#             'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
#           },
#         });
#         const data = await response.json();
#         if (response.ok) {
#           this.requests = data.requests;
#         } else {
#           console.error('Error fetching requests:', data.message || 'Unknown error');
#         }
#       } catch (error) {
#         console.error('Error fetching requests:', error);
#       }
#     },
#     async grantRequest(requestId) {
#       try {
#         const response = await fetch(`/api/requests/grant/${requestId}`, {
#           method: 'POST',
#           headers: {
#             'Content-Type': 'application/json',
#             'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
#           },
#         });
#         if (response.ok) {
#           alert('Request granted successfully');
#           this.fetchRequests(); // Refresh the list
#         } else {
#           const data = await response.json();
#           console.error('Error granting request:', data.message || 'Unknown error');
#           alert('Failed to grant request.');
#         }
#       } catch (error) {
#         console.error('Error granting request:', error);
#         alert('An error occurred while granting the request.');
#       }
#     },
#     async rejectRequest(requestId) {
#       try {
#         const response = await fetch(`/api/requests/reject/${requestId}`, {
#           method: 'POST',
#           headers: {
#             'Content-Type': 'application/json',
#             'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
#           },
#         });
#         if (response.ok) {
#           alert('Request rejected successfully');
#           this.fetchRequests(); // Refresh the list
#         } else {
#           const data = await response.json();
#           console.error('Error rejecting request:', data.message || 'Unknown error');
#           alert('Failed to reject request.');
#         }
#       } catch (error) {
#         console.error('Error rejecting request:', error);
#         alert('An error occurred while rejecting the request.');
#       }
#     },
#   },
# };
# </script>

# <style scoped>
# /* Add any necessary styles here */
# </style>
