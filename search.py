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
