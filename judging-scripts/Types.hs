{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE TemplateHaskell #-}

module Types where

import Data.Csv
import qualified Data.Text as T
import GHC.Generics
import Lens.Micro
import Lens.Micro.TH

data ScoreRow = ScoreRow
  { _technicalAbility :: !Int,
    _creativity :: !Int,
    _utility :: !Int,
    _presentation :: !Int,
    _impression :: !Int,
    _additionalComments :: !T.Text,
    _feedback :: !T.Text,
    _projectName :: !T.Text,
    _judge :: !T.Text
  }
  deriving (Generic, Show)

makeLenses ''ScoreRow

instance FromRecord ScoreRow

instance ToRecord ScoreRow
