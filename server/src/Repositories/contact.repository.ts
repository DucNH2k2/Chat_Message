import { ContactModel, IContact } from "~/Models/contact.model";

const findByUserId = async (userId: string): Promise<IContact[]> => {
    return await ContactModel.find({ userId });
}

export default {
    findByUserId
}