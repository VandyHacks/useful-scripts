{-# LANGUAGE DeriveFunctor              #-}
{-# LANGUAGE DeriveGeneric              #-}
{-# LANGUAGE GeneralizedNewtypeDeriving #-}
{-# LANGUAGE OverloadedStrings          #-}
{-# LANGUAGE TemplateHaskell            #-}

module Types where

import           Control.Applicative
import           Control.Monad
import           Data.Csv
import qualified Data.Text            as T
import           GHC.Generics
import           Lens.Micro
import           Lens.Micro.TH

data YN = Yes | No deriving (Generic, Show)

instance FromField YN where
  parseField "Yes" = pure Yes
  parseField "No"  = pure No
  parseField _     = mzero

instance ToField YN where
  toField Yes = "Yes"
  toField No  = "No"

newtype MInt = MInt { _val :: Maybe Int } deriving (Show, Ord, Eq)
makeLenses ''MInt

instance ToField MInt where
  toField (MInt Nothing)  = ""
  toField (MInt (Just i)) = toField (show i)

instance FromField MInt where
  parseField s = MInt <$> optional (parseField s)

data Attendance = Here | NoShow deriving (Show, Generic)

instance ToField Attendance where
  toField Here   = "Here"
  toField NoShow = "No show"

instance FromField Attendance where
  parseField "Here"    = pure Here
  parseField "No show" = pure NoShow

data ScoreRow = ScoreRow
    { _timestamp          :: !T.Text
    , _name               :: !T.Text
    , _table              :: !MInt
    , _technicalAbility   :: !MInt
    , _creativity         :: !MInt
    , _utility            :: !MInt
    , _presentation       :: !MInt
    , _impression         :: !MInt
    , _additionalComments :: !T.Text
    }
    deriving (Generic, Show)

makeLenses ''ScoreRow
instance FromRecord ScoreRow
instance ToRecord ScoreRow
