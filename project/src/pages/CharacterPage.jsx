import React, { useState, useEffect } from "react";
import { Plus, User, Edit, Trash2, Image } from "lucide-react";
import { CharacterModal } from "../PopUps/UpdatePopup";
import { DeleteCharacterModal } from "../PopUps/DeleteCharacter";
import { useAddCharacterMutation } from "../libs/domainService";

export const CharactersTab = ({
  characters = [],
  isLoading = false,
  error = null,
  selectedDomainId,
}) => {
  const [localCharacters, setLocalCharacters] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCharacter, setDeletingCharacter] = useState(undefined);

  useEffect(() => {
    // 🛡️ Safely set only if characters is a valid array
    setLocalCharacters(Array.isArray(characters) ? characters : []);
  }, [characters]);

  const { mutate: addCharacter } = useAddCharacterMutation(selectedDomainId);

  const handleCreateCharacter = () => {
    setEditingCharacter(undefined);
    setShowModal(true);
  };

  const handleEditCharacter = (character) => {
    setEditingCharacter(character);
    setShowModal(true);
  };

  const handleDeleteCharacter = (character) => {
    setDeletingCharacter(character);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deletingCharacter) {
      setLocalCharacters((prev) =>
        prev.filter((char) => char.id !== deletingCharacter.id)
      );
      setShowDeleteModal(false);
      setDeletingCharacter(undefined);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingCharacter(undefined);
  };

  const handleSaveCharacter = (characterData) => {
    if (!selectedDomainId) {
      alert("No domain selected.");
      return;
    }

    const formData = {
      characterName: characterData.name,
      bio: characterData.bio,
      profilePicture: characterData.profileImage,
      images: characterData.moreImages || [],
    };

    addCharacter(formData, {
      onSuccess: (updatedDomain) => {
        const newChar = updatedDomain.characters.at(-1);
        setLocalCharacters((prev) => [
          {
            id: newChar._id,
            name: newChar.characterName,
            bio: newChar.bio,
            profileImage: newChar.profilePicture,
            moreImages: newChar.images,
            createdAt: newChar.createdAt,
            updatedAt: newChar.updatedAt,
          },
          ...prev,
        ]);
        setShowModal(false);
        setEditingCharacter(undefined);
      },
      onError: (err) => {
        console.error("Add character failed:", err);
        alert("Failed to add character: " + err.message);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-300">
        Loading characters...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600 dark:text-red-400">
        Error loading characters.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Characters
                </h2>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Create and manage personas for your content creation
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateCharacter}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5" />
              Add Character
            </button>
          </div>
        </div>

        <div className="p-8">
          {localCharacters.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No characters yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first character to start generating personalized
                content
              </p>
              <button
                onClick={handleCreateCharacter}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                Create First Character
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {localCharacters.map((character) => (
                <div
                  key={character.id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                        {character.profileImage ? (
                          <img
                            src={character.profileImage}
                            alt={character.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                          {character.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md text-xs font-medium">
                            {character.moreImages?.length ?? 0} images
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditCharacter(character)}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit character"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCharacter(character)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete character"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4 mb-4">
                    {character.bio}
                  </p>

                  {(character.moreImages?.length ?? 0) > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Image className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Character Images ({character.moreImages.length})
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {(character.moreImages ?? [])
                          .slice(0, 6)
                          .map((img, idx) => (
                            <div
                              key={idx}
                              className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0"
                            >
                              <img
                                src={img}
                                alt={`Character image ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        {character.moreImages.length > 6 && (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              +{character.moreImages.length - 6}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                    <span>
                      Created{" "}
                      {new Date(character.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      Updated{" "}
                      {new Date(character.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CharacterModal
          character={editingCharacter}
          onClose={() => {
            setShowModal(false);
            setEditingCharacter(undefined);
          }}
          onSave={handleSaveCharacter}
        />
      )}

      {showDeleteModal && deletingCharacter && (
        <DeleteCharacterModal
          character={deletingCharacter}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};
