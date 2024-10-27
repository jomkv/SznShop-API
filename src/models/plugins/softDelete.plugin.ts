// * FROM: https://stackoverflow.com/a/62004999/17829428

import mongoose from "mongoose";

export type TWithSoftDeleted = {
  isDeleted: boolean;
  deletedAt: Date | null;
};

type TDocument = TWithSoftDeleted & mongoose.Document;

const softDeletePlugin = (schema: mongoose.Schema) => {
  schema.add({
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  const typesFindQueryMiddleware = [
    "count",
    "find",
    "findOne",
    "findOneAndDelete",
    "findOneAndRemove",
    "findOneAndUpdate",
    "update",
    "updateOne",
    "updateMany",
  ];

  const setDocumentIsDeleted = async (doc: TDocument) => {
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.$isDeleted(true);
    await doc.save();
  };

  const excludeInFindQueriesIsDeleted = async function (
    this: mongoose.Query<TDocument, any>,
    next: any
  ) {
    this.where({ isDeleted: false });
    next();
  };

  const excludeInDeletedInAggregateMiddleware = async function (
    this: mongoose.Aggregate<any>,
    next: any
  ) {
    this.pipeline().unshift({ $match: { isDeleted: false } });
    next();
  };

  schema.pre(
    "deleteOne",
    { document: true, query: false },
    async function (this: TDocument, next: any) {
      await setDocumentIsDeleted(this);
      next();
    }
  );

  typesFindQueryMiddleware.forEach((type: any) => {
    schema.pre(type, excludeInFindQueriesIsDeleted);
  });

  schema.pre("aggregate", excludeInDeletedInAggregateMiddleware);
};

export { softDeletePlugin };
